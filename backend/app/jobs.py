"""Small job-status store with Redis persistence and a safe in-process fallback.

The fallback intentionally only covers a single development process. Production
deployments should configure Redis so clients can resume status polling after a
worker restart.
"""
from __future__ import annotations

import json
import time
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable

import redis

from .config import settings


@dataclass
class Job:
    id: str
    kind: str
    status: str = "queued"
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    result: Any = None
    error: dict[str, Any] | None = None
    attempts: int = 0
    max_attempts: int = 2


class JobStore:
    _memory: dict[str, Job] = {}

    def __init__(self) -> None:
        self._redis: redis.Redis | None = None
        try:
            self._redis = redis.Redis.from_url(
                settings.redis_url, decode_responses=True, socket_connect_timeout=0.05, socket_timeout=0.05
            )
        except Exception:
            self._redis = None

    def _key(self, job_id: str) -> str:
        return f"jobs:v1:{job_id}"

    def save(self, job: Job) -> Job:
        job.updated_at = datetime.now(timezone.utc).isoformat()
        self._memory[job.id] = job
        if self._redis:
            try:
                self._redis.setex(self._key(job.id), 60 * 60 * 24, json.dumps(asdict(job), default=str))
            except Exception:
                pass
        return job

    def get(self, job_id: str) -> Job | None:
        if self._redis:
            try:
                raw = self._redis.get(self._key(job_id))
                if raw:
                    return Job(**json.loads(raw))
            except Exception:
                pass
        return self._memory.get(job_id)

    def create(self, kind: str) -> Job:
        return self.save(Job(id=f"job_{uuid.uuid4().hex}", kind=kind))

    def run(self, job: Job, operation: Callable[[], Any]) -> Job:
        job.status = "running"
        job.attempts += 1
        self.save(job)
        try:
            job.result = operation()
            job.status = "succeeded"
        except Exception:
            # Do not send exception text to a client; it may include internal
            # database/configuration information.
            job.status = "failed"
            job.error = {"code": "JOB_FAILED", "message": "The job could not be completed safely."}
        return self.save(job)


job_store = JobStore()
