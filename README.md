# CAMPUS-NEXUS v2

CAMPUS-NEXUS is a local full-stack demo of a college cognitive operating system. The repository contains a Next.js portal, a FastAPI service, SQLite development data, and explicit versioned contracts for the privacy-sensitive/ML capabilities that still require institution-specific validation.

## Run locally on Windows

Requirements: Node.js 20+, Python 3.11+, and Git. Redis/Postgres are optional for the demo; the default database is SQLite and the API falls back to an in-memory rate limiter when Redis is unavailable.

```powershell
Copy-Item .env.example .env
Set-ExecutionPolicy -Scope Process Bypass
./run.ps1
```

The script starts the API on `http://localhost:8000` and the web app on `http://localhost:3000`. Open [http://localhost:3000](http://localhost:3000), API docs at [http://localhost:8000/docs](http://localhost:8000/docs), readiness at [http://localhost:8000/api/v1/ready](http://localhost:8000/api/v1/ready), and the contract inventory at [http://localhost:8000/api/v1/contracts](http://localhost:8000/api/v1/contracts).

For separate processes:

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Verification

```powershell
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run format
cd backend
python -m pytest tests/test_api_v1_contracts.py tests/test_platform.py tests/test_jobs.py -q
```

The CI workflow runs these checks on every push and pull request. The app uses synthetic/demo content; do not upload real student records, grievance evidence, or examination scans. Sensitive contracts return a typed `501 capability_not_ready` response until their threat model, data agreements, calibration evidence, and operational worker infrastructure are approved. See `docs/PHASE_STATUS.md`, `docs/SECURITY_RISK_REGISTER.md`, and `LIMITATIONS.md` for the current boundary.

## Demo accounts

Use the seeded demo accounts shown by the login screen. They are local fixtures only and must not be reused in a deployed environment. Replace the default JWT secret and storage credentials before any shared deployment.
