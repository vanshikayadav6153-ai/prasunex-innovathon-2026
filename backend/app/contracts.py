"""Shared HTTP contract helpers for the public API.

Keeping errors in one small module makes FastAPI's generated OpenAPI document
useful to clients and prevents individual routes from inventing error shapes.
"""
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field


class ErrorBody(BaseModel):
    code: str = Field(..., examples=["VALIDATION_ERROR"])
    message: str
    details: Optional[Any] = None
    request_id: Optional[str] = None


class ErrorResponse(BaseModel):
    error: ErrorBody
    # `detail` is retained while older UI screens are migrated to the typed
    # envelope. New callers should read `error`.
    detail: Optional[Any] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NotReadyResponse(BaseModel):
    error: ErrorBody
    detail: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def error_payload(code: str, message: str, *, details: Any = None, request_id: str | None = None) -> dict:
    """Return the stable public error envelope without leaking internal state."""
    body = {"code": code, "message": message}
    if details is not None:
        body["details"] = details
    if request_id:
        body["request_id"] = request_id
    return {
        "error": body,
        "detail": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def not_ready_payload(feature: str, *, retryable: bool = False) -> dict:
    message = f"{feature} is not available in this deployment."
    return error_payload(
        "FEATURE_NOT_READY",
        message,
        details={"feature": feature, "retryable": retryable},
    )
