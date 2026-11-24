"""Rotating, signed QR tokens for attendance (module M12).

A token proves: "this code was issued by the server for this class session
within the last 15-30 seconds". It does NOT prove the student is physically
in the room. A photo of the QR sent to a friend still works inside that
window, so treat it as one signal, never as proof of presence.

Token format:  cnx1:<session_id>:<window>:<signature>
  window    = floor(unix_time / STEP_SECONDS)
  signature = first 32 hex chars of HMAC-SHA256(secret, "cnx1|<session_id>|<window>")

Secret: set ATTENDANCE_QR_SECRET in the environment (required in production).
If it is missing, a random per-process key is used (fine for local dev; tokens
stop working when the server restarts and do not work across several workers).
"""
from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
import time
from dataclasses import dataclass

STEP_SECONDS = 15
MAX_AGE_STEPS = 1  # current window + one previous one (token lives ~15-30 s)
PREFIX = "cnx1"

_SESSION_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
_WINDOW_RE = re.compile(r"^[0-9]{1,12}$")
_SIGNATURE_RE = re.compile(r"^[0-9a-f]{32}$")
_dev_secret: bytes | None = None


@dataclass(frozen=True)
class VerifyResult:
    ok: bool
    reason: str  # ok | malformed | bad_signature | from_future | expired
    session_id: str | None = None
    window: int | None = None


def _secret() -> bytes:
    global _dev_secret
    configured = os.environ.get("ATTENDANCE_QR_SECRET")
    if configured:
        return configured.encode("utf-8")
    if _dev_secret is None:
        _dev_secret = secrets.token_bytes(32)
    return _dev_secret


def current_window(now: float | None = None) -> int:
    return int((time.time() if now is None else now) // STEP_SECONDS)


def _sign(session_id: str, window: int) -> str:
    message = f"{PREFIX}|{session_id}|{window}".encode("utf-8")
    return hmac.new(_secret(), message, hashlib.sha256).hexdigest()[:32]


def issue_token(session_id: str, now: float | None = None) -> dict:
    """Create the QR text for the current 15-second window."""
    if not isinstance(session_id, str) or not _SESSION_RE.match(session_id):
        raise ValueError("session_id must be 1-64 characters of letters, digits, '-' or '_'")
    t = time.time() if now is None else now
    window = current_window(t)
    return {
        "token": f"{PREFIX}:{session_id}:{window}:{_sign(session_id, window)}",
        "window": window,
        "rotates_in": STEP_SECONDS - int(t % STEP_SECONDS),
    }


def _parse(token: object) -> tuple[str, int, str] | None:
    if not isinstance(token, str) or len(token) > 200:
        return None
    parts = token.split(":")
    if len(parts) != 4 or parts[0] != PREFIX:
        return None
    _, session_id, window_text, signature = parts
    if not _SESSION_RE.match(session_id) or not _WINDOW_RE.match(window_text):
        return None
    if not _SIGNATURE_RE.match(signature):
        return None
    return session_id, int(window_text), signature


def verify_token(token: object, now: float | None = None) -> VerifyResult:
    """Check the signature first, then how old the token is."""
    parsed = _parse(token)
    if parsed is None:
        return VerifyResult(False, "malformed")
    session_id, window, signature = parsed

    expected = _sign(session_id, window)
    if not hmac.compare_digest(expected.encode("utf-8"), signature.encode("utf-8")):
        return VerifyResult(False, "bad_signature")

    age = current_window(now) - window
    if age < 0:
        return VerifyResult(False, "from_future", session_id, window)
    if age > MAX_AGE_STEPS:
        return VerifyResult(False, "expired", session_id, window)
    return VerifyResult(True, "ok", session_id, window)