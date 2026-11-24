# Phase 06 — API contracts, jobs and offline boundary

## Covered requirements

The specification's 13 HTTP routes and `/ws/v1/sla-tracker/{id}` now have explicit FastAPI routes under `backend/app/modules/api_v1_contracts.py`. Pydantic request models reject malformed payloads before a capability is called. `GET /api/v1/contracts` exposes the inventory used by client and contract checks.

## Truthful capability states

Engines that have not passed their data, calibration, solver, or privacy prerequisites return HTTP 501 with `{error:{code,message,capability,prerequisite}}`. This keeps the interface stable without presenting a fixture as a production result. Sensitive grievance payloads are never queued or cached by this contract layer.

The WebSocket accepts a token query parameter for the current Socket.IO-compatible deployment, rejects missing or invalid access tokens with close code 4401, and closes a valid but unavailable stream with 1013 after a structured `not_ready` message. Production WSS should move token handling to the deployment's authenticated handshake.

## Files

- `backend/app/modules/api_v1_contracts.py` — typed v1 HTTP and WebSocket contracts.
- `backend/app/main.py` — registers the versioned routers.
- `frontend/lib/platform.ts` — bounded readiness fetch with timeout, retry, and response validation.
- `docs/FEATURE_TRACEABILITY.md` — contract evidence and follow-up work.

## Verification

- `python -m py_compile app/main.py app/modules/api_v1_contracts.py` passes.
- `pytest tests/test_platform.py` passes when run with an isolated writable SQLite database.
- `npm run typecheck` passes.
- `npm run lint` passes.
- Phase 03 Playwright run passed 3 desktop/tablet/mobile projects and exercised all 15 module routes.

## Remaining work

The 501 responses are intentional until each owning engine has labelled data, calibrated evaluation, authorization review, and a service adapter. Offline queues must remain limited to non-sensitive operations. No benchmark, cryptographic, regulatory, or model-accuracy claim is verified by this phase.
