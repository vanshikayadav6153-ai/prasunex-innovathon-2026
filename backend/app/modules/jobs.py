"""Typed boundary for long-running OCR, training and solver jobs.

The API intentionally reports not-ready until a managed worker/result backend is
configured; it never fabricates progress or silently executes heavy work inline.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict

from ..models import User
from ..security import get_current_user

router = APIRouter(prefix="/api/v1", tags=["Jobs"])


class JobStatus(BaseModel):
    model_config = ConfigDict(extra="forbid")

    job_id: str
    status: str
    progress: int | None = None
    result: dict | None = None
    error: dict | None = None


@router.get("/jobs/{job_id}", response_model=JobStatus, status_code=501)
def job_status(job_id: str, user: User = Depends(get_current_user)) -> JobStatus:
    return JobStatus(
        job_id=job_id,
        status="not_ready",
        error={
            "code": "job_queue_not_ready",
            "message": "Background job status is not enabled in this environment.",
            "prerequisite": "Managed Redis result backend, worker health checks and retention policy",
        },
    )
