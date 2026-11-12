.PHONY: up down seed test demo help clean

PYTHON ?= ./backend/.venv/bin/python
PYTEST ?= ./backend/.venv/bin/pytest

help:
	@echo "CAMPUS-NEXUS v2 Makefile Commands:"
	@echo "  make up     - Start all services (Docker Compose if present, else local servers)"
	@echo "  make down   - Stop all containers / services"
	@echo "  make seed   - Seed 1 college, 2 departments, 5 courses, ~200 students, 6 professors, HoD, Dean, Technicians, Warden, Admin"
	@echo "  make test   - Run full pytest test suite (Auth, RBAC, 75% Forecaster, IRT, Hungarian, ZK)"
	@echo "  make demo   - Run seed and launch local demo environment"

up:
	@if command -v docker >/dev/null 2>&1; then \
		echo "Starting services via Docker Compose..."; \
		docker compose up -d; \
	else \
		echo "Docker CLI not detected in current path. Starting in local Python & Next.js mode..."; \
		PYTHONPATH=backend $(PYTHON) -m uvicorn app.main:app --host 0.0.0.0 --port 8000 & \
		echo "Backend running at http://localhost:8000"; \
	fi

down:
	@if command -v docker >/dev/null 2>&1; then \
		docker compose down; \
	else \
		pkill -f "uvicorn app.main:app" || true; \
	fi

seed:
	@echo "Running deterministic database seed script..."
	PYTHONPATH=backend $(PYTHON) backend/app/seed.py

test:
	@echo "Executing pytest test suite..."
	PYTHONPATH=backend $(PYTEST) backend/tests/ -v

demo: seed
	@echo "=========================================================="
	@echo "  CAMPUS-NEXUS v2: COGNITIVE CAMPUS OPERATING SYSTEM"
	@echo "  Demo Ready on Local Host"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Frontend: http://localhost:3000"
	@echo "=========================================================="
	@echo "Starting servers..."
	PYTHONPATH=backend $(PYTHON) -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

clean:
	rm -rf backend/__pycache__ backend/app/__pycache__ backend/app/modules/__pycache__
	rm -f backend/campus_nexus.db
