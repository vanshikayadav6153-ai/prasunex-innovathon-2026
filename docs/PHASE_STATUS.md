# CAMPUS-NEXUS v2 Phase Status

Source of truth: docs/CAMPUS_NEXUS_v2_ORIGINAL_SPEC.md.

## Phase 00 - Existing Repository Audit and Requirement Lock

Status: VERIFIED

The active application is a Next.js 14 frontend in frontend/ and a FastAPI application in backend/app/. Root startup scripts are run.ps1 for Windows and run.sh for POSIX shells. The root route is a public landing page. Existing protected routes are /student/dashboard, /faculty/dashboard, /admin/dashboard, /other/dashboard, and /dashboard. The frontend/app/api routes use an in-process demo data implementation, while FastAPI exposes the existing /api routes. The separate systems must remain explicitly identified until a single authentication and API client contract is implemented.

The backend contains router modules for authentication, academic work, grading, facilities, privacy, attendance, study planning, peer matching, opportunity discovery, accreditation, and business privacy. Existing tests are in backend/tests/. Browser coverage is in frontend/tests/campus.spec.ts. Existing dependencies include Next.js, React, Recharts, FastAPI, SQLAlchemy, Redis, Socket.IO, Celery, NumPy, SciPy, scikit-learn, and ONNX Runtime.

The complete source requirement mapping is in docs/FEATURE_TRACEABILITY.md. The security concerns and unresolved claims are in docs/SECURITY_RISK_REGISTER.md. Architecture decisions are in docs/ARCHITECTURE_DECISIONS.md.

## Phase 01 - Safe Architecture Foundation

Status: FOUNDATION COMPLETE; PRODUCTION INTEGRATION PENDING

Completed:

- FastAPI health route and versioned readiness route at /api/v1/ready.
- Phase 06 contract inventory at /api/v1/contracts and typed contracts for every specified HTTP route plus /ws/v1/sla-tracker/{id}. Unavailable engines return structured 501 capability_not_ready responses.
- SQLite local fallback, Alembic configuration, compose configuration, and local seed data.
- Frontend typed readiness client with a bounded timeout and retry.
- Dependency lockfile at backend/requirements.lock.
- Lint, typecheck, pytest, and Playwright scripts.
- Local encrypted vault abstraction and bounded probe logging.
- Reproducible `README.md` with Windows/POSIX-adjacent commands, truthful demo boundary, and verification commands.
- GitHub Actions CI for frontend typecheck/lint/format/build and backend contract/platform/job tests.
- Shared frontend `apiRequest<T>` client with bounded timeout, idempotent retry, structured API errors, and readiness integration.
- Protected `GET /api/v1/jobs/{job_id}` boundary for OCR/training/CP-SAT worker status; it returns typed `501 job_queue_not_ready` until managed Redis workers and retention are configured.

Remaining:

- The application remains split between the Next demo API and FastAPI service; the shared client is now the migration seam, not a claim that authentication is unified.
- Production PostgreSQL, Redis, encrypted object storage, TLS, secret rotation, queue monitoring, and CI require deployment configuration.
- Versioned implementations for the specification's 13 HTTP routes are contract-complete. Engine adapters remain pending where the prerequisite model, labelled data, or privacy review is absent.

## Phase 02 - Landing Page and Design System

Status: VERIFIED for the interactive DEMO surface

The landing page has a light theme, accessible focus styles, responsive layout with a mobile menu, persona previews, live preview status text, an illustrative trend chart, 15-module catalog, campus-gap links, plans, and a demo-contact draft. Preview metrics and all sample data carry DEMO or fictitious-record labels. The theme control persists the user's local choice. The three public persona previews are read-only.

## Phase 03 - Role Consoles

Status: DEMO_ONLY (journeys documented; production APIs pending)

Student, Professor, and Admin entry points exist. The student dashboard includes the specified ten navigation labels and scrolls to working dashboard or DEMO module content. The professor and admin dashboards contain review workspaces where each example action records a local demo review result. All 15 modules are available through role-specific cards and detail pages.

Feature data is labelled DEMO until an authenticated FastAPI contract, institutional data source, and module-specific validation are available.

The responsive screenshot/journey acceptance checklist is in `docs/PHASE03_SCREENSHOT_CHECKLIST.md`. It covers Student's ten navigation areas, Professor's marks/audit/scheduling review queue, and Admin's SLA/equipment/grievance/event/roles queue across desktop, tablet, and mobile.

Verification on 24 Nov 2026: frontend typecheck, direct ESLint, Prettier check, and Playwright landing/catalog workflow pass on desktop, tablet, and mobile using the installed Chrome channel. Backend full suite passes 69 tests. `next build` remains a local infrastructure probe that stalls before compiler output in the shared runtime junction; it is not used as evidence of feature readiness.

## Route Inventory

| Surface | Routes | Status |
| --- | --- | --- |
| Public landing and previews | /, /preview/student, /preview/faculty, /preview/admin | VERIFIED DEMO |
| Module catalog | /modules, /modules/m01 through /modules/m15 | VERIFIED DEMO |
| Student | /student/dashboard | VERIFIED DEMO shell |
| Professor | /faculty/dashboard | VERIFIED DEMO shell |
| Admin | /admin/dashboard | VERIFIED DEMO shell |
| Authentication | /login, /403, /dashboard | Existing |
| API health | /health, /api/v1/ready, /docs | VERIFIED |

## UX Comparison

| Role | Existing strength | Current gap | Next increment |
| --- | --- | --- | --- |
| Student | Ten-area navigation, mastery, effort, study, copilot, attendance, and peer UI | Several cards are illustrative fixtures | Connect read-only student APIs and preserve uncertainty labels |
| Professor | Grading sandbox, item analysis, risk, and outcomes UI | Imports, audits, and schedule review need versioned API contracts | Implement M05, M08, M09, and M10 contracts |
| Admin | Ticket, facilities, billing, and accreditation UI | Sensitive grievance and asset forecasts require production controls | Implement M03, M13, M14, and privacy review |

## Dependency Graph

Landing and persona previews -> authenticated role entry -> Student, Professor, and Admin consoles -> 15 module catalog -> FastAPI module services -> tenant database, object storage, and job workers.

## Incremental Strategy

1. Consolidate authentication and use a typed /api/v1 client.
2. Implement module contracts with structured not_ready responses where model work is pending.
3. Add tenant authorization and integration tests for each write path.
4. Add model provenance, uncertainty, and human-review workflows before institutional use.
5. Complete a privacy threat model before activating anonymous reporting.
