from datetime import date, datetime, timedelta, timezone
import json
import uuid
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models import (AssessmentQuestion, ConceptNode, Course, DrillQuestionReview, KnowledgeState,
                      ReviewAttempt, ReviewCard, ReviewEvent, ReviewReminderJob, StudyPlanItem, User)
from ..security import get_current_user

router = APIRouter(prefix="/api", tags=["Study support"])
RETENTION_DECAY = 9.0
REVIEW_THRESHOLD = 0.90
SUCCESS_ALPHA = 0.20


def retention(elapsed_days: float, stability: float) -> float:
    """Source-specified simplified curve; not the full FSRS model."""
    return (1.0 + max(0.0, elapsed_days) / (9.0 * max(0.01, stability))) ** -1


def _aware(value: datetime | None) -> datetime:
    if value is None:
        return datetime.now(timezone.utc)
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)


def is_card_due(next_due: datetime, retention_value: float, now: datetime) -> bool:
    return _aware(next_due) <= _aware(now) or retention_value <= REVIEW_THRESHOLD


class PlanRequest(BaseModel):
    available_hours_per_day: float = Field(default=1.0, ge=0.25, le=8)
    days: int = Field(default=7, ge=1, le=14)


@router.get("/study-plan")
def get_plan(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(StudyPlanItem, Course).join(
        Course, (Course.id == StudyPlanItem.course_id) & (Course.tenant_id == StudyPlanItem.tenant_id)
    ).filter(StudyPlanItem.tenant_id == user.tenant_id, StudyPlanItem.student_id == user.id).order_by(
        StudyPlanItem.scheduled_date, StudyPlanItem.id
    ).all()
    return [{"id": item.id, "date": item.scheduled_date, "course_id": item.course_id,
             "course_code": course.code, "course_title": course.title, "concept_code": item.concept_code,
             "duration_minutes": item.duration_minutes, "activity": item.activity, "completed": item.completed}
            for item, course in items]


@router.post("/study-plan/generate")
def generate_plan(payload: PlanRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Deterministic planner prioritises low BKT mastery; it is not a generative AI prediction.
    states = db.query(KnowledgeState, Course).join(
        Course, (Course.id == KnowledgeState.course_id) & (Course.tenant_id == KnowledgeState.tenant_id)
    ).filter(KnowledgeState.tenant_id == user.tenant_id, KnowledgeState.student_id == user.id).order_by(
        KnowledgeState.bkt_mastery.asc()
    ).all()
    if not states:
        raise HTTPException(status_code=404, detail="No course mastery data is available yet")
    db.query(StudyPlanItem).filter(StudyPlanItem.tenant_id == user.tenant_id,
                                   StudyPlanItem.student_id == user.id, StudyPlanItem.completed.is_(False)).delete()
    budget = max(1, int(payload.available_hours_per_day * 60))
    sessions_per_day = max(1, budget // 25)
    cap = min(payload.days * sessions_per_day, 28)
    today = date.today()
    created = []
    for index in range(cap):
        state, course = states[index % len(states)]
        day = today + timedelta(days=index // sessions_per_day)
        duration = min(40, max(15, budget // sessions_per_day))
        item = StudyPlanItem(
            id=f"plan-{uuid.uuid4().hex[:12]}", tenant_id=user.tenant_id, student_id=user.id,
            course_id=course.id, concept_code=state.concept_code, scheduled_date=day.isoformat(),
            duration_minutes=duration, activity=f"Review {state.concept_code} foundations, then solve 3 practice questions.",
        )
        db.add(item)
        created.append(item)
    db.commit()
    return {"model": "deterministic mastery-priority planner (demo)", "generated": len(created),
            "plan": get_plan(user, db)}


@router.patch("/study-plan/{item_id}/complete")
def complete_item(item_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(StudyPlanItem).filter(StudyPlanItem.id == item_id,
        StudyPlanItem.tenant_id == user.tenant_id, StudyPlanItem.student_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Study activity not found")
    item.completed = not item.completed
    db.commit()
    return {"id": item.id, "completed": item.completed}


def _ensure_review_cards(db: Session, user: User) -> None:
    candidates = db.query(AssessmentQuestion, ConceptNode, KnowledgeState).join(
        DrillQuestionReview, (DrillQuestionReview.question_id == AssessmentQuestion.id) & DrillQuestionReview.is_published.is_(True)
    ).join(ConceptNode, (ConceptNode.course_id == AssessmentQuestion.course_id) & (ConceptNode.concept_code == AssessmentQuestion.concept_code)).outerjoin(
        KnowledgeState, (KnowledgeState.tenant_id == user.tenant_id) & (KnowledgeState.student_id == user.id) &
        (KnowledgeState.course_id == AssessmentQuestion.course_id) & (KnowledgeState.concept_code == AssessmentQuestion.concept_code)
    ).filter(AssessmentQuestion.tenant_id == user.tenant_id, ConceptNode.tenant_id == user.tenant_id).all()
    now = datetime.now(timezone.utc)
    for question, concept, mastery in candidates:
        exists = db.query(ReviewCard.id).filter(ReviewCard.tenant_id == user.tenant_id,
            ReviewCard.student_id == user.id, ReviewCard.concept_id == concept.id).first()
        if not exists and (mastery is None or mastery.bkt_mastery < 0.80):
            db.add(ReviewCard(tenant_id=user.tenant_id, student_id=user.id, concept_id=concept.id,
                stability=1.0, difficulty=float(question.irt_b), reps=0, last_review=now,
                next_due=now, state="new"))
    db.flush()


@router.get("/micro-drills")
def micro_drills(course_id: str | None = None, priority: str | None = Query(default=None),
                 timezone_name: str = Query(default="UTC", alias="timezone"),
                 user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError:
        raise HTTPException(status_code=422, detail="Unknown IANA timezone")
    _ensure_review_cards(db, user)
    db.commit()
    rows = db.query(ReviewCard, ConceptNode, Course, AssessmentQuestion, DrillQuestionReview, KnowledgeState).join(
        ConceptNode, ConceptNode.id == ReviewCard.concept_id
    ).join(Course, (Course.id == ConceptNode.course_id) & (Course.tenant_id == ReviewCard.tenant_id)).join(
        AssessmentQuestion, (AssessmentQuestion.course_id == Course.id) & (AssessmentQuestion.concept_code == ConceptNode.concept_code)
    ).join(DrillQuestionReview, (DrillQuestionReview.question_id == AssessmentQuestion.id) & DrillQuestionReview.is_published.is_(True)).outerjoin(
        KnowledgeState, (KnowledgeState.tenant_id == ReviewCard.tenant_id) & (KnowledgeState.student_id == ReviewCard.student_id) &
        (KnowledgeState.course_id == Course.id) & (KnowledgeState.concept_code == ConceptNode.concept_code)
    ).filter(ReviewCard.tenant_id == user.tenant_id, ReviewCard.student_id == user.id).order_by(ReviewCard.next_due.asc()).all()
    now, result, seen = datetime.now(timezone.utc), [], set()
    for card, concept, course, question, review, mastery in rows:
        if card.id in seen or (course_id and course.id != course_id):
            continue
        seen.add(card.id)
        if priority == "high" and mastery is not None and mastery.bkt_mastery >= .5:
            continue
        elapsed = max(0.0, (now - _aware(card.last_review)).total_seconds() / 86400)
        ret = retention(elapsed, card.stability)
        result.append({"card_id": card.id, "question_id": question.id, "course_id": course.id,
            "course_code": course.code, "course_title": course.title, "concept_code": concept.concept_code,
            "concept_name": concept.name, "mastery": round(mastery.bkt_mastery, 3) if mastery else None,
            "difficulty": card.difficulty, "difficulty_label": "Foundations" if card.difficulty < -.4 else "Practice" if card.difficulty < .7 else "Challenge",
            "stability_days": round(card.stability, 3), "retention": round(ret, 4),
            "due": is_card_due(card.next_due, ret, now),
            "next_due": _aware(card.next_due).isoformat(), "state": card.state, "reps": card.reps,
            "prompt": question.prompt, "options": json.loads(review.options_json), "explanation": review.explanation,
            "source_citation": review.source_citation, "teacher_reviewed": True,
            "model_note": "R(t,S)=(1+t/(9S))^-1 is a simplified source equation, FSRS-style and not a full validated FSRS implementation."})
    result.sort(key=lambda item: (not item["due"], item["mastery"] if item["mastery"] is not None else 0, item["next_due"]))
    return result


class ReviewSubmission(BaseModel):
    card_id: int
    question_id: int
    selected_idx: int = Field(ge=0)
    confidence: int = Field(ge=1, le=5)
    idempotency_key: str = Field(min_length=8, max_length=100)
    response_ms: int | None = Field(default=None, ge=0, le=3600000)


@router.post("/micro-drills/answer")
def submit_micro_drill(payload: ReviewSubmission, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prior = db.query(ReviewAttempt).filter(ReviewAttempt.tenant_id == user.tenant_id,
        ReviewAttempt.student_id == user.id, ReviewAttempt.idempotency_key == payload.idempotency_key).first()
    if prior:
        review = db.query(DrillQuestionReview).filter(DrillQuestionReview.question_id == prior.question_id).first()
        return {"attempt_id": prior.id, "duplicate": True, "is_correct": prior.is_correct,
            "feedback": "This answer was already recorded.", "stability": prior.stability_after,
            "stability_before": prior.stability_before, "next_due": _aware(prior.next_due).isoformat(),
            "retention_before": prior.retention_before, "correct_idx": review.correct_idx if review else None,
            "explanation": review.explanation if review else None,
            "source_citation": review.source_citation if review else None}
    row = db.query(ReviewCard, ConceptNode, AssessmentQuestion, DrillQuestionReview).join(
        ConceptNode, ConceptNode.id == ReviewCard.concept_id
    ).join(AssessmentQuestion, (AssessmentQuestion.course_id == ConceptNode.course_id) & (AssessmentQuestion.concept_code == ConceptNode.concept_code)).join(
        DrillQuestionReview, (DrillQuestionReview.question_id == AssessmentQuestion.id) & DrillQuestionReview.is_published.is_(True)
    ).filter(ReviewCard.id == payload.card_id, ReviewCard.tenant_id == user.tenant_id,
        ReviewCard.student_id == user.id, AssessmentQuestion.id == payload.question_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Review card or published question not found")
    card, concept, question, review = row
    if payload.selected_idx >= len(json.loads(review.options_json)):
        raise HTTPException(status_code=422, detail="Selected option is outside the answer choices")
    now = datetime.now(timezone.utc)
    elapsed = max(0.0, (now - _aware(card.last_review)).total_seconds() / 86400)
    r_before = retention(elapsed, card.stability)
    correct = payload.selected_idx == review.correct_idx
    before = max(.01, card.stability)
    after = before * (1 + SUCCESS_ALPHA) if correct else max(.1, before * .5)
    due = now + (timedelta(days=after) if correct else timedelta(minutes=10))
    attempt = ReviewAttempt(id=f"rev-{uuid.uuid4().hex}", tenant_id=user.tenant_id, student_id=user.id,
        card_id=card.id, question_id=question.id, idempotency_key=payload.idempotency_key,
        selected_idx=payload.selected_idx, is_correct=correct, confidence=payload.confidence,
        response_ms=payload.response_ms, reviewed_at=now, stability_before=before,
        stability_after=after, retention_before=r_before, next_due=due)
    db.add(attempt)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        prior = db.query(ReviewAttempt).filter(ReviewAttempt.tenant_id == user.tenant_id,
            ReviewAttempt.student_id == user.id, ReviewAttempt.idempotency_key == payload.idempotency_key).first()
        if prior:
            review = db.query(DrillQuestionReview).filter(DrillQuestionReview.question_id == prior.question_id).first()
            return {"attempt_id": prior.id, "duplicate": True, "is_correct": prior.is_correct,
                "feedback": "This answer was already recorded.", "stability": prior.stability_after,
                "stability_before": prior.stability_before, "next_due": _aware(prior.next_due).isoformat(),
                "retention_before": prior.retention_before, "correct_idx": review.correct_idx if review else None,
                "explanation": review.explanation if review else None,
                "source_citation": review.source_citation if review else None}
        raise
    card.stability, card.reps, card.last_review, card.next_due = after, card.reps + 1, now, due
    card.state = "review" if correct else "relearning"
    db.add(ReviewEvent(id=f"evt-{uuid.uuid4().hex}", tenant_id=user.tenant_id,
        student_id=user.id, card_id=card.id, attempt_id=attempt.id,
        payload_json=json.dumps({"correct": correct, "confidence": payload.confidence, "stability": after})))
    db.commit()
    return {"attempt_id": attempt.id, "duplicate": False, "is_correct": correct,
        "correct_idx": review.correct_idx, "feedback": "Correct. Stability increased." if correct else "Not quite. Review the explanation; this card is scheduled for a retry.",
        "explanation": review.explanation, "source_citation": review.source_citation,
        "retention_before": round(r_before, 4), "stability_before": before, "stability": after,
        "next_due": due.isoformat(), "confidence": payload.confidence}


@router.get("/micro-drills/history")
def micro_drill_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(ReviewAttempt, AssessmentQuestion, Course).join(
        AssessmentQuestion, AssessmentQuestion.id == ReviewAttempt.question_id
    ).join(Course, Course.id == AssessmentQuestion.course_id).filter(
        ReviewAttempt.tenant_id == user.tenant_id, ReviewAttempt.student_id == user.id
    ).order_by(ReviewAttempt.reviewed_at.desc()).limit(50).all()
    return [{"attempt_id": a.id, "question": q.prompt, "course_code": c.code,
        "correct": a.is_correct, "confidence": a.confidence,
        "reviewed_at": _aware(a.reviewed_at).isoformat(), "stability_after": a.stability_after,
        "next_due": _aware(a.next_due).isoformat()} for a, q, c in attempts]


class ReminderRequest(BaseModel):
    scheduled_local: datetime
    timezone: str = Field(min_length=1, max_length=80)


@router.post("/micro-drills/{card_id}/reminder")
def schedule_review_reminder(card_id: int, payload: ReminderRequest,
                             user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = db.query(ReviewCard).filter(ReviewCard.id == card_id,
        ReviewCard.tenant_id == user.tenant_id, ReviewCard.student_id == user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Review card not found")
    try:
        zone = ZoneInfo(payload.timezone)
    except ZoneInfoNotFoundError:
        raise HTTPException(status_code=422, detail="Unknown IANA timezone")
    local = payload.scheduled_local
    if local.tzinfo is not None:
        scheduled = local.astimezone(timezone.utc)
    else:
        attached = local.replace(tzinfo=zone, fold=0)
        scheduled = attached.astimezone(timezone.utc)
        # Reject nonexistent local wall times during the spring DST jump.
        if scheduled.astimezone(zone).replace(tzinfo=None) != local:
            raise HTTPException(status_code=422, detail="This local time does not exist because of a daylight-saving transition")
    if scheduled <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="Reminder time must be in the future")
    dedupe = f"{user.id}:{card.id}:{scheduled.isoformat()}"
    job = db.query(ReviewReminderJob).filter(ReviewReminderJob.dedupe_key == dedupe).first()
    deduplicated = job is not None
    if not job:
        job = ReviewReminderJob(id=f"rem-{uuid.uuid4().hex}", tenant_id=user.tenant_id,
            student_id=user.id, card_id=card.id, scheduled_for=scheduled,
            timezone_name=payload.timezone, dedupe_key=dedupe)
        db.add(job)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            job = db.query(ReviewReminderJob).filter(ReviewReminderJob.dedupe_key == dedupe).first()
    return {"id": job.id, "status": job.status, "scheduled_for": _aware(job.scheduled_for).isoformat(),
        "timezone": job.timezone_name, "deduplicated": deduplicated}
