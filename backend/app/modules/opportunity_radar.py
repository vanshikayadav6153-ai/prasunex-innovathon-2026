import io
import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing

from ..database import get_db
from ..models import College, GatePass, HackathonEvent, SquadRequest, User
from ..security import get_current_user, require_roles

router = APIRouter(prefix="/api/opportunities", tags=["Opportunity Radar"])


class EventCreateRequest(BaseModel):
    title: str
    organizer: str
    deadline: str
    tags: list[str] = []


class SquadEntryRequest(BaseModel):
    event_id: str
    skills: list[str]
    preferred_role: str  # Frontend, Backend, ML/AI, UI/UX, Pitch/Product


class VerifyPassRequest(BaseModel):
    token: str


# --- 1. Fest / Hackathon Feed ---

@router.get("/events")
def list_events(
    tag: str | None = None,
    deadline_before: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List opportunities with filtering by tag or date.
    """
    query = db.query(HackathonEvent).filter(HackathonEvent.tenant_id == user.tenant_id)
    events = query.all()

    filtered = []
    for e in events:
        tags = json.loads(e.tags_json) if e.tags_json else []
        if tag and tag.lower() not in [t.lower() for t in tags]:
            continue
        if deadline_before and e.deadline > deadline_before:
            continue
        filtered.append({
            "id": e.id,
            "title": e.title,
            "organizer": e.organizer,
            "deadline": e.deadline,
            "tags": tags,
            "source": e.source,
        })
    return filtered


@router.post("/events")
def create_event(
    payload: EventCreateRequest,
    user: User = Depends(require_roles(["admin", "dean", "professor"])),
    db: Session = Depends(get_db),
):
    event = HackathonEvent(
        id=f"{user.tenant_id}-event-{uuid.uuid4().hex[:8]}",
        tenant_id=user.tenant_id,
        title=payload.title,
        organizer=payload.organizer,
        deadline=payload.deadline,
        source=f"Created by {user.full_name}",
        tags_json=json.dumps(payload.tags),
        teams_json="[]",
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"id": event.id, "title": event.title, "status": "created"}


# --- 2. 1-Click Gate Pass with QR Code ---

@router.post("/gate-pass/{event_id}")
def generate_gate_pass(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    1-Click Gate Pass:
    Generates a unique security gate token and returns gate pass details.
    """
    event = db.query(HackathonEvent).filter(HackathonEvent.id == event_id, HackathonEvent.tenant_id == user.tenant_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = db.query(GatePass).filter(
        GatePass.student_id == user.id,
        GatePass.event_id == event_id,
        GatePass.tenant_id == user.tenant_id,
    ).first()

    if existing:
        token = existing.token
        gate_pass = existing
    else:
        token = f"GATE-{uuid.uuid4().hex[:12].upper()}"
        gate_pass = GatePass(
            id=f"gp-{uuid.uuid4().hex[:10]}",
            tenant_id=user.tenant_id,
            student_id=user.id,
            event_id=event.id,
            token=token,
            is_used=False,
        )
        db.add(gate_pass)
        db.commit()
        db.refresh(gate_pass)

    verification_url = f"http://localhost:8000/api/opportunities/gate-pass/verify-token/{token}"

    return {
        "gate_pass_id": gate_pass.id,
        "token": token,
        "student_name": user.full_name,
        "student_email": user.email,
        "event_title": event.title,
        "event_organizer": event.organizer,
        "is_used": gate_pass.is_used,
        "download_pdf_url": f"/api/opportunities/gate-pass/{token}/download",
        "verification_url": verification_url,
    }


@router.get("/gate-pass/{token}/download")
def download_gate_pass_pdf(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Generates downloadable official PDF gate pass with embedded QR code.
    """
    gate_pass = db.query(GatePass).filter(GatePass.token == token).first()
    if not gate_pass:
        raise HTTPException(status_code=404, detail="Invalid gate pass token")

    student = db.query(User).filter(User.id == gate_pass.student_id).first()
    event = db.query(HackathonEvent).filter(HackathonEvent.id == gate_pass.event_id).first()
    college = db.query(College).filter(College.id == gate_pass.tenant_id).first()

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Draw Header & Card background
    c.setFillColorRGB(0.09, 0.06, 0.14)  # Dark plum
    c.rect(40, height - 380, width - 80, 320, fill=True, stroke=False)

    # Border neon cyan
    c.setStrokeColorRGB(0.0, 0.94, 1.0)
    c.setLineWidth(2)
    c.rect(40, height - 380, width - 80, 320, fill=False, stroke=True)

    # Title text
    c.setFillColorRGB(1.0, 1.0, 1.0)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(60, height - 100, "CAMPUS-NEXUS v2 — OFFICIAL GATE PASS")

    c.setFont("Helvetica", 11)
    c.setFillColorRGB(0.0, 0.94, 1.0)
    c.drawString(60, height - 120, f"ISSUING CAMPUS: {college.name if college else 'NITX'} ({college.code if college else 'NITX'})")

    c.setFillColorRGB(0.85, 0.85, 0.9)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(60, height - 160, f"Event: {event.title if event else 'Campus Hackathon'}")

    c.setFont("Helvetica", 11)
    c.drawString(60, height - 185, f"Attendee: {student.full_name if student else 'Student'}")
    c.drawString(60, height - 205, f"Email: {student.email if student else ''} | Dept: {student.department if student else 'CSE'}")
    c.drawString(60, height - 225, f"Status: {'[USED / CHECKED IN]' if gate_pass.is_used else '[AUTHORIZED / VALID ENTRY]'}")
    c.drawString(60, height - 245, f"Token: {token}")

    # Draw QR code using ReportLab QrCodeWidget
    qr = QrCodeWidget(f"CAMPUS-NEXUS-GATE:{token}")
    bounds = qr.getBounds()
    qr_w = bounds[2] - bounds[0]
    qr_h = bounds[3] - bounds[1]
    d = Drawing(120, 120, transform=[120.0 / qr_w, 0, 0, 120.0 / qr_h, 0, 0])
    d.add(qr)
    from reportlab.graphics import renderPDF
    renderPDF.draw(d, c, width - 200, height - 260)

    c.setFont("Helvetica-Oblique", 9)
    c.setFillColorRGB(0.6, 0.6, 0.7)
    c.drawString(60, height - 350, "Scan QR at campus entrance kiosk. Single entry valid token.")

    c.showPage()
    c.save()
    buffer.seek(0)

    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="gate_pass_{token}.pdf"'},
    )


@router.post("/gate-pass/verify")
def verify_gate_pass(
    payload: VerifyPassRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    QR verification endpoint that validates token and marks it used!
    """
    gate_pass = db.query(GatePass).filter(GatePass.token == payload.token.strip().upper()).first()
    if not gate_pass:
        raise HTTPException(status_code=404, detail="Invalid gate pass token")

    if gate_pass.is_used:
        return {
            "status": "already_used",
            "message": f"Pass was already redeemed on {gate_pass.used_at.isoformat() if gate_pass.used_at else 'earlier'}.",
            "token": gate_pass.token,
            "is_valid": False,
        }

    gate_pass.is_used = True
    gate_pass.used_at = datetime.now(timezone.utc)
    db.commit()

    student = db.query(User).filter(User.id == gate_pass.student_id).first()
    event = db.query(HackathonEvent).filter(HackathonEvent.id == gate_pass.event_id).first()

    return {
        "status": "verified_and_used",
        "message": f"Gate pass verified successfully! Admitted {student.full_name if student else 'Student'} for {event.title if event else 'Event'}.",
        "token": gate_pass.token,
        "is_valid": True,
        "attendee": student.full_name if student else "",
        "used_at": gate_pass.used_at.isoformat(),
    }


# --- 3. Squad Matcher Entry ---

@router.post("/squad-request")
def submit_squad_request(
    payload: SquadEntryRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Squad Matcher Entry:
    Stores student squad preferences (skills, preferred role, event) for Phase 8 Hungarian team matching!
    """
    existing = db.query(SquadRequest).filter(
        SquadRequest.student_id == user.id,
        SquadRequest.event_id == payload.event_id,
        SquadRequest.tenant_id == user.tenant_id,
    ).first()

    if existing:
        existing.skills_json = json.dumps(payload.skills)
        existing.preferred_role = payload.preferred_role
        squad_entry = existing
    else:
        squad_entry = SquadRequest(
            tenant_id=user.tenant_id,
            student_id=user.id,
            event_id=payload.event_id,
            skills_json=json.dumps(payload.skills),
            preferred_role=payload.preferred_role,
        )
        db.add(squad_entry)

    db.commit()
    db.refresh(squad_entry)

    return {
        "status": "registered",
        "message": f"Squad matcher entry saved. You will be matched into a 3-4 person team for this event.",
        "skills": payload.skills,
        "preferred_role": payload.preferred_role,
        "event_id": payload.event_id,
    }
