"""BKT-first mastery analytics and cycle-safe prerequisite DAG APIs."""
from __future__ import annotations

import json
import os
import uuid
from collections import deque
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..bkt import P_GUESS, P_L0, P_SLIP, P_TRANSIT, confidence_label, posterior, update
from ..database import get_db
from ..models import ConceptAttempt, ConceptNode, Course, KnowledgeState, User
from ..security import get_current_user, require_roles, verify_student_row_level_security

router = APIRouter(prefix="/api/v1/analytics", tags=["M01 BKT mastery and prerequisite DAG"])


class AttemptRequest(BaseModel):
    student_id: str
    course_id: str
    concept_code: str
    is_correct: bool | None = None
    source: Literal["assessment", "micro_drill", "manual"] = "assessment"


class PrerequisiteUpdate(BaseModel):
    prereq_codes: list[str] = Field(default_factory=list)


def _can_access(student_id: str, user: User) -> None:
    if user.role == "student":
        verify_student_row_level_security(student_id, user)


def _dag(nodes: list[ConceptNode]) -> dict[str, list[str]]:
    return {node.concept_code: json.loads(node.prereq_codes_json or "[]") for node in nodes}


def _assert_acyclic(dag: dict[str, list[str]]) -> None:
    visiting, visited = set(), set()
    def visit(node: str):
        if node in visiting: raise HTTPException(422, "Prerequisite graph contains a cycle.")
        if node in visited: return
        visiting.add(node)
        for parent in dag.get(node, []):
            if parent not in dag: raise HTTPException(422, f"Unknown prerequisite concept '{parent}'.")
            visit(parent)
        visiting.remove(node); visited.add(node)
    for concept in dag: visit(concept)


def _blocker(target: str, mastery: dict[str, float], dag: dict[str, list[str]], labels: dict[str, str]) -> dict | None:
    queue, distances, paths = deque([target]), {target: 0}, {target: [target]}
    while queue:
        node = queue.popleft()
        for parent in dag.get(node, []):
            if parent not in distances:
                distances[parent] = distances[node] + 1; paths[parent] = paths[node] + [parent]; queue.append(parent)
    ancestors = [code for code in distances if code != target and mastery.get(code, P_L0) < 0.5]
    if not ancestors: return None
    # Earliest means most upstream (furthest backward); within a level select weakest.
    code = sorted(ancestors, key=lambda item: (-distances[item], mastery.get(item, P_L0), item))[0]
    return {"concept_id": code, "concept_name": labels.get(code, code), "mastery_pct": round(mastery.get(code, P_L0) * 100, 1), "blocker_severity": "Critical" if mastery.get(code, P_L0) < 0.35 else "Moderate", "path_from_target": paths[code], "root_cause": f"{labels.get(code, code)} is the earliest weak prerequisite on the dependency path to {labels.get(target, target)}."}


@router.post("/dkt/attempts")
def record_attempt(payload: AttemptRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _can_access(payload.student_id, user)
    student = db.query(User).filter(User.id == payload.student_id, User.tenant_id == user.tenant_id).first()
    course = db.query(Course).filter(Course.id == payload.course_id, Course.tenant_id == user.tenant_id).first()
    concept = db.query(ConceptNode).filter(ConceptNode.course_id == payload.course_id, ConceptNode.tenant_id == user.tenant_id, ConceptNode.concept_code == payload.concept_code).first()
    if not student or not course or not concept: raise HTTPException(404, "Student, course, or concept was not found in your tenant.")
    if payload.is_correct is None: return {"recorded": False, "reason": "Missing response does not update BKT mastery."}
    state = db.query(KnowledgeState).filter(KnowledgeState.tenant_id == user.tenant_id, KnowledgeState.student_id == student.id, KnowledgeState.course_id == course.id, KnowledgeState.concept_code == concept.concept_code).first()
    prior = state.bkt_mastery if state else P_L0
    observed, next_mastery = posterior(prior, payload.is_correct)
    db.add(ConceptAttempt(id=f"att-{uuid.uuid4().hex[:16]}", tenant_id=user.tenant_id, student_id=student.id, course_id=course.id, concept_code=concept.concept_code, is_correct=payload.is_correct, source=payload.source))
    if not state:
        state = KnowledgeState(tenant_id=user.tenant_id, student_id=student.id, course_id=course.id, concept_code=concept.concept_code, bkt_mastery=next_mastery, dkt_mastery=next_mastery, attempts=1, correct_count=int(payload.is_correct)); db.add(state)
    else:
        state.bkt_mastery = next_mastery; state.dkt_mastery = next_mastery; state.attempts += 1; state.correct_count += int(payload.is_correct); state.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"recorded": True, "prior": prior, "posterior_before_learning": observed, "mastery": next_mastery, "parameters": {"P_L0": P_L0, "T": P_TRANSIT, "G": P_GUESS, "S": P_SLIP}}


@router.get("/dkt/{student_id}")
def dkt_analytics(student_id: str, course_id: str | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _can_access(student_id, user)
    student = db.query(User).filter(User.id == student_id, User.tenant_id == user.tenant_id).first()
    if not student: raise HTTPException(404, "Student not found in your tenant.")
    course_query = db.query(Course).filter(Course.tenant_id == user.tenant_id)
    if course_id: course_query = course_query.filter(Course.id == course_id)
    course = course_query.first()
    if not course: raise HTTPException(404, "Course not found in your tenant.")
    nodes = db.query(ConceptNode).filter(ConceptNode.tenant_id == user.tenant_id, ConceptNode.course_id == course.id).all()
    dag, labels = _dag(nodes), {n.concept_code: n.name for n in nodes}
    _assert_acyclic(dag)
    states = db.query(KnowledgeState).filter(KnowledgeState.tenant_id == user.tenant_id, KnowledgeState.student_id == student.id, KnowledgeState.course_id == course.id).all()
    state_map = {state.concept_code: state for state in states}
    mastery = {node.concept_code: (state_map[node.concept_code].bkt_mastery if node.concept_code in state_map else P_L0) for node in nodes}
    attempts = db.query(ConceptAttempt).filter(ConceptAttempt.tenant_id == user.tenant_id, ConceptAttempt.student_id == student.id, ConceptAttempt.course_id == course.id).order_by(ConceptAttempt.occurred_at.asc()).all()
    concepts = []
    for node in nodes:
        state = state_map.get(node.concept_code); count = state.attempts if state else 0; confidence, warning = confidence_label(count)
        concepts.append({"id": node.concept_code, "name": node.name, "mastery_pct": round(mastery[node.concept_code] * 100, 1), "attempts": count, "confidence": confidence, "warning": warning, "prerequisites": dag[node.concept_code]})
    weak_targets = sorted((item for item in concepts if item["mastery_pct"] < 50), key=lambda item: item["mastery_pct"])
    blockers = [blocker for target in weak_targets if (blocker := _blocker(target["id"], mastery, dag, labels))]
    overall = round(sum(mastery.values()) / max(1, len(mastery)) * 100, 1)
    risk = "High" if overall < 50 or any(b["blocker_severity"] == "Critical" for b in blockers) else ("Moderate" if overall < 70 else "Low")
    return {"student_id": student.id, "student_name": student.full_name, "course_id": course.id, "model": {"name": "BKT baseline", "status": "active", "parameters": {"P_L0": P_L0, "T": P_TRANSIT, "G": P_GUESS, "S": P_SLIP}, "dkt_lstm": {"status": "BLOCKED_EXPERIMENTAL", "reason": "No consented training dataset and validated model checkpoint are configured."}}, "overall_mastery_pct": overall, "risk_level": risk, "concepts": concepts, "edges": [{"source": parent, "target": child} for child, parents in dag.items() for parent in parents], "attempt_history": [{"concept_code": a.concept_code, "is_correct": a.is_correct, "source": a.source, "occurred_at": a.occurred_at.isoformat()} for a in attempts], "prerequisite_blockers": blockers, "recommended_next_steps": [f"Complete a short drill on {b['concept_name']} before retrying downstream work." for b in blockers[:3]] or ["Complete a diagnostic attempt to replace the baseline prior with observed evidence."]}


@router.put("/dkt/courses/{course_id}/concepts/{concept_code}/prerequisites")
def update_prerequisites(course_id: str, concept_code: str, payload: PrerequisiteUpdate, user: User = Depends(require_roles(["professor", "faculty", "hod", "dean", "admin"])), db: Session = Depends(get_db)):
    nodes = db.query(ConceptNode).filter(ConceptNode.tenant_id == user.tenant_id, ConceptNode.course_id == course_id).all()
    target = next((node for node in nodes if node.concept_code == concept_code), None)
    if not target: raise HTTPException(404, "Concept not found.")
    dag = _dag(nodes); dag[concept_code] = payload.prereq_codes; _assert_acyclic(dag)
    target.prereq_codes_json = json.dumps(payload.prereq_codes); db.commit()
    return {"course_id": course_id, "concept_code": concept_code, "prerequisites": payload.prereq_codes, "cycle_free": True}
