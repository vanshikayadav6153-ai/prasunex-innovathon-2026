# CAMPUS-NEXUS API contracts (v1)

The OpenAPI document is served at `/openapi.json` and interactive documentation
at `/docs`. All failures use `{ "error": { "code", "message", "details" },
"detail", "timestamp" }`; `detail` remains temporarily for legacy screens.

| Method | Contract path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/zk-proof` | Validate a zero-knowledge proof |
| POST | `/api/v1/marks/ingest-csv` | Validate and ingest mark rows |
| POST | `/api/v1/marks/ingest-photo` | Returns `501 FEATURE_NOT_READY` until OCR review is deployed |
| POST | `/api/v1/grading/simulate` | Calculate a grading curve |
| GET | `/api/v1/analytics/dkt/{id}` | Return DKT mastery analytics |
| POST | `/api/v1/student/what-if` | Calculate study-hour projection |
| POST | `/api/v1/student/study-plan` | Build a deterministic study plan |
| POST | `/api/v1/paper/audit` | Audit Bloom/IRT paper characteristics |
| POST | `/api/v1/schedule/solve` | Solve timetable; `async_mode: true` returns `202` with a job URL |
| GET | `/api/v1/jobs/{job_id}` | Poll a long-running operation safely |
| POST | `/api/v1/copilot/ask` | Returns `501 FEATURE_NOT_READY` until retrieval/citation verification is deployed |
| POST | `/api/v1/attendance/scan` | Verify attendance scan and geofence |
| GET | `/api/v1/admin/equipment/forecast` | Weibull equipment-risk forecast |
| POST | `/api/v1/grievance/submit` | Submit a facility or ZK grievance; never queued offline |
| WS | `/ws/v1/sla-tracker/{id}` | Authenticated ticket SLA stream; accepts cookie, Bearer token, or `access_token` query parameter |

Rate limits use Redis when available, with an in-process fallback during local
development. Job state and the last SLA event are persisted in Redis with short
TTLs when Redis is available. The browser client lives in `frontend/lib/api-client.ts`.
Its offline queue is opt-in and permits only non-sensitive copilot and paper-audit
requests; it excludes grievances, student identifiers, attendance, marks, and
exam credentials.
