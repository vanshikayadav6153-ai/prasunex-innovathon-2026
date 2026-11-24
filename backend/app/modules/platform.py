"""Versioned operational probes with no tenant data."""
from importlib.util import find_spec
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter(prefix="/api/v1", tags=["Platform"])

class Readiness(BaseModel):
    ready: bool
    database: str
    capabilities: dict[str, bool]

@router.get("/ready", response_model=Readiness, responses={503: {"model": Readiness}})
def readiness(response: Response, db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        ready = True
    except Exception:
        ready = False
        response.status_code = 503
    return Readiness(ready=ready, database=db.get_bind().dialect.name if ready else "unavailable",
                     capabilities={name: find_spec(package) is not None for name, package in
                                   {"opencv_installed":"cv2", "solver_installed":"ortools", "torch_installed":"torch"}.items()})
