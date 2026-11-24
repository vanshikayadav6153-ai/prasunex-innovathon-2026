"""Versioned contract surface for the capabilities in the original specification.

These routes make the public interface explicit while individual engines are being
validated. A not-ready response is deliberate and contains no fabricated result.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Annotated, Any

import jwt
from fastapi import APIRouter, Depends, File, Query, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session

from ..config import settings
from ..database import SessionLocal, get_db
from ..models import User
from ..security import get_current_user

router = APIRouter(prefix="/api/v1", tags=["Versioned capability contracts"])
ws_router = APIRouter(tags=["Versioned capability contracts"])


class ContractError(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str
    message: str
    capability: str
    prerequisite: str


class NotReadyResponse(BaseModel):
    error: ContractError


class ZKProofRequest(BaseModel):
    proof: str = Field(min_length=1, max_length=16_384)
    merkle_root: str = Field(min_length=1, max_length=256)
    nullifier: str = Field(min_length=1, max_length=256)
    signal: str = Field(min_length=1, max_length=512)


class MarksIngestRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content_base64: str = Field(min_length=1, max_length=8_000_000)
    filename: str = Field(min_length=1, max_length=160)
    course_id: str = Field(min_length=1, max_length=80)


class GradingSimulationRequest(BaseModel):
    course_id: str = Field(min_length=1, max_length=80)
    mode: str = Field(pattern="^(absolute|relative|gap-aware)$")
    mean_shift: float = Field(default=0, ge=-100, le=100)
    std_scale: float = Field(default=1, gt=0, le=5)


class WhatIfRequest(BaseModel):
    course_id: str = Field(min_length=1, max_length=80)
    study_hours: dict[str, float] = Field(min_length=1, max_length=30)


class StudyPlanRequest(BaseModel):
    available_hours_per_day: float = Field(ge=0.25, le=8)
    days: int = Field(ge=1, le=14)


class PaperAuditRequest(BaseModel):
    course_id: str = Field(min_length=1, max_length=80)
    questions: list[str] = Field(min_length=1, max_length=100)


class ScheduleSolveRequest(BaseModel):
    exam_ids: list[str] = Field(min_length=1, max_length=500)
    constraints: dict[str, Any] = Field(default_factory=dict)


class CopilotRequest(BaseModel):
    course_id: str = Field(min_length=1, max_length=80)
    question: str = Field(min_length=1, max_length=2_000)


class AttendanceScanRequest(BaseModel):
    qr_token: str = Field(min_length=1, max_length=512)
    course_id: str = Field(min_length=1, max_length=80)
    device_hash: str = Field(min_length=1, max_length=256)


class GrievanceRequest(BaseModel):
    proof: str = Field(min_length=1, max_length=16_384)
    nullifier: str = Field(min_length=1, max_length=256)
    target_tag: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=20_000)


def _not_ready(capability: str, prerequisite: str) -> JSONResponse:
    return JSONResponse(
        status_code=501,
        content={
            "error": {
                "code": "capability_not_ready",
                "message": f"{capability} is not enabled in this environment.",
                "capability": capability,
                "prerequisite": prerequisite,
            }
        },
    )


@router.get("/contracts")
def contract_inventory() -> dict[str, Any]:
    return {
        "version": "v1",
        "status": "contracted",
        "sensitive_offline_cache": False,
        "routes": [
            "POST /api/v1/auth/zk-proof",
            "POST /api/v1/marks/ingest-csv",
            "POST /api/v1/marks/ingest-photo",
            "POST /api/v1/grading/simulate",
            "GET /api/v1/analytics/dkt/{id}",
            "POST /api/v1/student/what-if",
            "POST /api/v1/student/study-plan",
            "POST /api/v1/paper/audit",
            "POST /api/v1/schedule/solve",
            "POST /api/v1/copilot/ask",
            "POST /api/v1/attendance/scan",
            "GET /api/v1/admin/equipment/forecast",
            "POST /api/v1/grievance/submit",
            "WS /ws/v1/sla-tracker/{id}",
        ],
    }


@router.post("/auth/zk-proof", response_model=NotReadyResponse, status_code=501)
def verify_zk_proof(payload: ZKProofRequest):
    return _not_ready("Semaphore ZK proof verification", "Independent privacy threat-model review and verifier deployment")


@router.post("/marks/ingest-csv", response_model=NotReadyResponse, status_code=501)
def ingest_csv(payload: MarksIngestRequest, user: User = Depends(get_current_user)):
    return _not_ready("CSV marks ingestion", "Course-specific column mapping and faculty approval workflow")


@router.post("/marks/ingest-photo", response_model=NotReadyResponse, status_code=501)
async def ingest_photo(
    course_id: Annotated[str, Query(min_length=1, max_length=80)],
    photo: Annotated[UploadFile, File()],
    user: User = Depends(get_current_user),
):
    await photo.close()
    return _not_ready("Photo marks OCR", "Redacted labelled scans, checksum validation and faculty review")


@router.post("/grading/simulate", response_model=NotReadyResponse, status_code=501)
def grading_simulate(payload: GradingSimulationRequest, user: User = Depends(get_current_user)):
    return _not_ready("Versioned grading simulation", "Contract adapter to the existing grading service and approval audit")


@router.get("/analytics/dkt/{student_id}", response_model=NotReadyResponse, status_code=501)
def dkt_analytics(student_id: str, user: User = Depends(get_current_user)):
    return _not_ready("Versioned DKT analytics", "Calibrated model artifact and held-out cohort evaluation")


@router.post("/student/what-if", response_model=NotReadyResponse, status_code=501)
def student_what_if(payload: WhatIfRequest, user: User = Depends(get_current_user)):
    return _not_ready("GPA what-if forecasting", "Consented longitudinal outcomes and calibrated uncertainty")


@router.post("/student/study-plan", response_model=NotReadyResponse, status_code=501)
def student_study_plan(payload: StudyPlanRequest, user: User = Depends(get_current_user)):
    return _not_ready("Versioned study-plan contract", "Typed adapter to the existing mastery-priority planner")


@router.post("/paper/audit", response_model=NotReadyResponse, status_code=501)
def paper_audit(payload: PaperAuditRequest, user: User = Depends(get_current_user)):
    return _not_ready("Question-paper audit", "Approved syllabus, Bloom mapping and labelled reference papers")


@router.post("/schedule/solve", response_model=NotReadyResponse, status_code=501)
def schedule_solve(payload: ScheduleSolveRequest, user: User = Depends(get_current_user)):
    return _not_ready("CP-SAT exam scheduling", "Institutional exam, room and invigilator constraints")


@router.post("/copilot/ask", response_model=NotReadyResponse, status_code=501)
def copilot_ask(payload: CopilotRequest, user: User = Depends(get_current_user)):
    return _not_ready("Grounded syllabus copilot", "Vetted courseware index and citation-abstention evaluation")


@router.post("/attendance/scan", response_model=NotReadyResponse, status_code=501)
def attendance_scan(payload: AttendanceScanRequest, user: User = Depends(get_current_user)):
    return _not_ready("Rotating QR attendance", "Institution key provisioning, replay tests and attendance policy review")


@router.get("/admin/equipment/forecast", response_model=NotReadyResponse, status_code=501)
def equipment_forecast(user: User = Depends(get_current_user)):
    return _not_ready("Weibull equipment forecast", "Censored maintenance history and reliability calibration")


@router.post("/grievance/submit", response_model=NotReadyResponse, status_code=501)
def grievance_submit(payload: GrievanceRequest):
    return _not_ready("Anonymous grievance submission", "Independent threat-model review and sensitive intake deployment")


@ws_router.websocket("/ws/v1/sla-tracker/{ticket_id}")
async def sla_tracker(websocket: WebSocket, ticket_id: str, token: str | None = None):
    await websocket.accept()
    if not token:
        await websocket.send_json({"error": {"code": "authentication_required", "message": "A bearer token is required for SLA tracking."}})
        await websocket.close(code=4401)
        return
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("type") != "access":
            raise ValueError("wrong token type")
    except Exception:
        await websocket.send_json({"error": {"code": "authentication_failed", "message": "The supplied access token is invalid."}})
        await websocket.close(code=4401)
        return
    await websocket.send_json({"ticket_id": ticket_id, "status": "not_ready", "message": "Live SLA tracking is not enabled in this environment."})
    await websocket.close(code=1013)

