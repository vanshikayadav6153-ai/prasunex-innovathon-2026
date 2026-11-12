from contextlib import asynccontextmanager
from collections import defaultdict
from datetime import datetime, timezone
import os
import sys
import time
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
import redis
import socketio
from sqlalchemy import text
from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
backend_path = Path(__file__).resolve().parents[1]
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from .config import settings
from .database import Base, engine, get_db
from .models import College, Course, KnowledgeState, MaintenanceTicket, User
from .security import get_current_user

# Import all functional routers
from .modules.auth_tenancy import router as auth_router
from .modules.academic_engine import router as academic_router
from .modules.opportunity_radar import router as opportunity_router
from .modules.facilities import router as facilities_router
from .modules.privacy import router as privacy_router
from .modules.grading import router as grading_router, get_cache_stats
from .modules.dkt_engine import router as dkt_router
from .modules.network import router as network_router
from .modules.business_privacy import router as business_privacy_router
from .modules.accreditation import router as accreditation_router
from .modules.attendance import router as attendance_router
from .modules.study import router as study_router


# Initialize python-socketio ASGI server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        from .seed import seed_database
        seed_database()
    except Exception as e:
        print(f"Lifespan seed notice: {e}")
    yield


app = FastAPI(
    title="CAMPUS-NEXUS v2 API",
    description="Cognitive Operating System for Colleges — Real Runnable Architecture",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rate Limiting: 100 requests / minute / IP (Redis-backed with local sliding-window memory fallback)
_memory_rate_limits = defaultdict(list)
_metrics_request_count = 0
_metrics_error_count = 0
_metrics_latency_sum = 0.0
_LATENCY_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
_metrics_latency_counts = defaultdict(int)


@app.middleware("http")
async def rate_limit_and_metrics_middleware(request: Request, call_next):
    global _metrics_request_count, _metrics_error_count, _metrics_latency_sum
    _metrics_request_count += 1
    start_time = time.perf_counter()

    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()

    # Skip rate limiting for static docs and health checks
    bypass_paths = ["/health", "/metrics", "/docs", "/openapi.json"]
    if request.url.path not in bypass_paths:
        allowed = True
        try:
            r = redis.Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=0.08)
            key = f"ratelimit:{client_ip}:{int(now // 60)}"
            count = r.incr(key)
            if count == 1:
                r.expire(key, 60)
            if count > settings.rate_limit_per_minute:
                allowed = False
        except Exception:
            # Memory sliding window fallback
            timestamps = [t for t in _memory_rate_limits[client_ip] if now - t < 60]
            if len(timestamps) >= settings.rate_limit_per_minute:
                allowed = False
            else:
                timestamps.append(now)
                _memory_rate_limits[client_ip] = timestamps

        if not allowed:
            _metrics_error_count += 1
            duration = time.perf_counter() - start_time
            _metrics_latency_sum += duration
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded: maximum {settings.rate_limit_per_minute} requests per minute per IP."},
            )

    try:
        response = await call_next(request)
        duration = time.perf_counter() - start_time
        _metrics_latency_sum += duration
        for b in _LATENCY_BUCKETS:
            if duration <= b:
                _metrics_latency_counts[b] += 1
        if response.status_code >= 400:
            _metrics_error_count += 1
        return response
    except Exception as exc:
        duration = time.perf_counter() - start_time
        _metrics_latency_sum += duration
        _metrics_error_count += 1
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "error_type": type(exc).__name__, "path": request.url.path},
        )


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error_type": type(exc).__name__, "message": str(exc)},
    )


# Register all modular routers
app.include_router(auth_router)
app.include_router(academic_router)
app.include_router(opportunity_router)
app.include_router(facilities_router)
app.include_router(privacy_router)
app.include_router(grading_router)
app.include_router(dkt_router)
app.include_router(network_router)
app.include_router(business_privacy_router)
app.include_router(accreditation_router)
app.include_router(attendance_router)
app.include_router(study_router)


# --- Health & Prometheus Metrics Endpoints ---

@app.get("/health")
def health(db: Session = Depends(get_db)):
    """
    Health check endpoint:
    Verifies database connection, Redis cache availability, and returns service status.
    """
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    redis_status = "connected"
    try:
        r = redis.Redis.from_url(settings.redis_url, socket_connect_timeout=0.08)
        r.ping()
    except Exception:
        redis_status = "offline (using local fallback)"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "service": "campus-nexus-api",
        "version": "2.0.0",
        "database": db_status,
        "redis": redis_status,
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/metrics")
def metrics(db: Session = Depends(get_db)):
    """
    Prometheus metrics endpoint.
    Exposes request count, error count, latency histogram, cache hit ratio, and SLA breaches for Grafana.
    """
    hits, misses = get_cache_stats()
    total_cache_ops = hits + misses
    hit_ratio = round((hits / max(1, total_cache_ops)) * 100, 2)

    # SLA breaches: open tickets past deadline
    now = datetime.now(timezone.utc)
    sla_breaches = 0
    try:
        sla_breaches = db.query(MaintenanceTicket).filter(
            MaintenanceTicket.status != "Student sign-off",
            MaintenanceTicket.sla_deadline < now,
        ).count()
    except Exception:
        pass

    lines = [
        "# HELP campus_nexus_http_requests_total Total HTTP requests served",
        "# TYPE campus_nexus_http_requests_total counter",
        f"campus_nexus_http_requests_total {_metrics_request_count}",
        "# HELP campus_nexus_http_errors_total Total HTTP errors (4xx/5xx)",
        "# TYPE campus_nexus_http_errors_total counter",
        f"campus_nexus_http_errors_total {_metrics_error_count}",
        "# HELP campus_nexus_http_request_duration_seconds HTTP request latency in seconds",
        "# TYPE campus_nexus_http_request_duration_seconds histogram",
    ]
    for b in _LATENCY_BUCKETS:
        lines.append(f'campus_nexus_http_request_duration_seconds_bucket{{le="{b}"}} {_metrics_latency_counts[b]}')
    lines.append(f'campus_nexus_http_request_duration_seconds_bucket{{le="+Inf"}} {_metrics_request_count}')
    lines.append(f"campus_nexus_http_request_duration_seconds_sum {_metrics_latency_sum:.4f}")
    lines.append(f"campus_nexus_http_request_duration_seconds_count {_metrics_request_count}")

    lines.extend([
        "# HELP campus_nexus_cache_hits_total Grade sheet and query cache hits",
        "# TYPE campus_nexus_cache_hits_total counter",
        f"campus_nexus_cache_hits_total {hits}",
        "# HELP campus_nexus_cache_misses_total Grade sheet and query cache misses",
        "# TYPE campus_nexus_cache_misses_total counter",
        f"campus_nexus_cache_misses_total {misses}",
        "# HELP campus_nexus_cache_hit_ratio Cache hit ratio percentage",
        "# TYPE campus_nexus_cache_hit_ratio gauge",
        f"campus_nexus_cache_hit_ratio {hit_ratio}",
        "# HELP campus_nexus_sla_breaches_total Number of facilities tickets currently breaching SLA deadline",
        "# TYPE campus_nexus_sla_breaches_total gauge",
        f"campus_nexus_sla_breaches_total {sla_breaches}",
        "# HELP campus_nexus_up Campus Nexus service health status",
        "# TYPE campus_nexus_up gauge",
        "campus_nexus_up 1",
    ])
    return PlainTextResponse("\n".join(lines), media_type="text/plain")


@app.get("/api/dashboard/overview")
def dashboard_overview(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    college = db.query(College).filter(College.id == user.tenant_id).first()
    students = db.query(User).filter(User.tenant_id == user.tenant_id, User.role == "student").all()
    tickets = db.query(MaintenanceTicket).filter(MaintenanceTicket.tenant_id == user.tenant_id, MaintenanceTicket.status != "Student sign-off").count()
    concepts = db.query(KnowledgeState).filter(KnowledgeState.tenant_id == user.tenant_id).all()
    courses_count = db.query(Course).filter(Course.tenant_id == user.tenant_id).count()

    avg_mastery = round(sum(c.dkt_mastery for c in concepts) / max(1, len(concepts)) * 100, 1) if concepts else 68.0

    return {
        "college_name": college.name if college else user.tenant_id,
        "college_code": college.code if college else "NITX",
        "tier_name": college.tier.capitalize() if college else "Autonomous Enterprise",
        "student_count": len(students),
        "average_attendance": 78.4,
        "open_tickets": tickets,
        "average_mastery": avg_mastery,
        "courses": courses_count,
    }


# Socket.IO Event Handlers
@sio.event
async def connect(sid, environ):
    pass


@sio.event
async def disconnect(sid):
    pass


# Combine FastAPI and Socket.IO into one ASGI app
sio_app = socketio.ASGIApp(sio, other_asgi_app=app)
