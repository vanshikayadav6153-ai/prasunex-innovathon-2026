import hashlib
import json
import math
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import College, MaintenanceTicket, TicketAuditLedger, User
from ..security import get_current_user, require_roles
from ml.inference import classify_defect_image, cosine_similarity, embed_text

router = APIRouter(prefix="/api/facilities", tags=["Facilities & Grievance Desk"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024

CAMPUS_NODES = [
    "Lab 2 - Bench 14",
    "Hostel A - Water",
    "Block C - Ground floor",
    "Electronics Lab 2",
    "Turing Auditorium - AV Desk",
    "Hostel B - Power Substation",
    "Library - 1st Floor Server",
]

CATEGORY_BASE_WEIGHTS = {
    "oscilloscope": 3.0,
    "it_hardware": 3.0,
    "electrical": 4.0,
    "water/leak": 4.0,
    "plumbing": 4.0,
    "chair/furniture": 1.5,
    "furniture": 1.5,
    "other": 1.0,
    "civil": 1.5,
    "safety": 4.5,
}

STATUS_TIMELINE = [
    "Ticket verified",
    "Technician dispatched",
    "Component replaced",
    "Student sign-off",
]


def calculate_priority_weight(category: str, n_reports: int, created_at: datetime, demo_multiplier: float = 1.0) -> float:
    """
    Innovation 3 Priority Formula:
    W = Base * log2(1 + N) * (1 + 0.1 * delta_t_hours)
    Base by category (equipment > furniture, water/power > general).
    Unit-test verified: N=10 => log2(11) ~= 3.46x, and delta_t=48h => (1 + 0.1*48) = 5.8x.
    """
    base = CATEGORY_BASE_WEIGHTS.get(category.lower(), 1.0)
    log_factor = math.log2(1.0 + max(1, n_reports))

    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    elapsed_seconds = max(0, (now - created_at).total_seconds()) * demo_multiplier
    delta_t_hours = elapsed_seconds / 3600.0
    time_factor = 1.0 + (0.1 * delta_t_hours)

    return round(base * log_factor * time_factor, 3)


def append_hash_chained_ledger(db: Session, tenant_id: str, ticket_id: str, action: str, actor_id: str | None, payload: dict) -> TicketAuditLedger:
    """
    Append-only, hash-chained audit ledger for every ticket action.
    Each row stores the SHA-256 hash of the previous row.
    """
    last_entry = (
        db.query(TicketAuditLedger)
        .filter(TicketAuditLedger.ticket_id == ticket_id)
        .order_by(TicketAuditLedger.id.desc())
        .first()
    )
    prev_hash = last_entry.current_hash if last_entry else ("0" * 64)
    now = datetime.now(timezone.utc)
    payload_json = json.dumps(payload, sort_keys=True)
    current_hash = TicketAuditLedger.compute_hash(prev_hash, ticket_id, action, payload_json, now)

    ledger_row = TicketAuditLedger(
        tenant_id=tenant_id,
        ticket_id=ticket_id,
        action=action,
        actor_id=actor_id,
        prev_hash=prev_hash,
        current_hash=current_hash,
        payload_json=payload_json,
        timestamp=now,
    )
    db.add(ledger_row)
    db.flush()
    return ledger_row


# --- 1. Nodes & Ticket List ---

@router.get("/nodes")
def get_campus_nodes():
    return CAMPUS_NODES


@router.get("/tickets")
def list_tickets(
    status: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(MaintenanceTicket).filter(MaintenanceTicket.tenant_id == user.tenant_id)
    if status:
        query = query.filter(MaintenanceTicket.status == status)

    # Technicians and admins see all; students see their own plus tickets at same location
    if user.role == "student":
        query = query.filter(
            (MaintenanceTicket.reporter_id == user.id) |
            (MaintenanceTicket.status != "Student sign-off")
        )

    tickets = query.all()
    now = datetime.now(timezone.utc)
    demo_mult = settings.demo_time_multiplier

    result = []
    for t in tickets:
        # Recompute dynamic priority weight W
        t_weight = calculate_priority_weight(t.vision_category, t.merged_count, t.created_at, demo_mult)
        t.priority_weight = t_weight

        # Check escalation level based on elapsed time * demo_multiplier
        created_tz = t.created_at if t.created_at.tzinfo else t.created_at.replace(tzinfo=timezone.utc)
        elapsed_hours = (now - created_tz).total_seconds() * demo_mult / 3600.0

        escalation_notice = None
        if t.status != "Student sign-off":
            if elapsed_hours >= 72.0:
                t.escalation_level = 2
                escalation_notice = "ESCALATED TO DEAN: Ticket open > 72 hours SLA breach!"
            elif elapsed_hours >= 48.0:
                t.escalation_level = 1
                escalation_notice = "ESCALATED TO HOD: Ticket open > 48 hours SLA threshold."

        deadline_tz = t.sla_deadline if t.sla_deadline.tzinfo else t.sla_deadline.replace(tzinfo=timezone.utc)
        remaining_seconds = max(0, int((deadline_tz - now).total_seconds() / demo_mult))

        result.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "location": t.location,
            "category": t.vision_category,
            "confidence": t.vision_confidence,
            "priority": t.priority,
            "priority_weight": t_weight,
            "status": t.status,
            "sla_category": t.sla_category,
            "sla_deadline": t.sla_deadline.isoformat(),
            "remaining_seconds": remaining_seconds,
            "escalation_level": t.escalation_level,
            "escalation_notice": escalation_notice,
            "merged_count": t.merged_count,
            "merged_into_id": t.merged_into_id,
            "assigned_to_id": t.assigned_to_id,
            "photo_url": f"/api/facilities/photos/{os.path.basename(t.photo_path)}" if t.photo_path else None,
            "resolution_photo_url": f"/api/facilities/photos/{os.path.basename(t.resolution_photo)}" if t.resolution_photo else None,
            "resolution_notes": t.resolution_notes,
            "created_at": t.created_at.isoformat(),
        })

    # Sort queue by priority weight W descending
    return sorted(result, key=lambda x: x["priority_weight"], reverse=True)


# --- 2. Ticket Submission with Vision + SBERT Dedup ---

@router.post("/tickets", status_code=201)
async def submit_ticket(
    title: str = Form(...),
    description: str = Form(""),
    location: str = Form("Lab 2 - Bench 14"),
    priority: str = Form("Medium"),
    photo: UploadFile | None = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Innovation 3:
    1. Vision MobileNetV3 CPU classification on uploaded photo
    2. SBERT 384-d dense text embedding
    3. Cosine dedup check (>= 0.82) against open tickets at SAME location
       - If match: merges into existing ticket, increments N, notifies reporter
       - If no match: creates new ticket, routes to technician or warden
    4. Records event into hash-chained ledger
    """
    if not title.strip():
        raise HTTPException(status_code=400, detail="Ticket title is required")

    photo_bytes = None
    photo_path = None
    if photo and photo.filename:
        photo_bytes = await photo.read()
        if len(photo_bytes) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=400, detail="Photo size exceeds 10MB limit")
        os.makedirs(settings.upload_dir, exist_ok=True)
        filename = f"ticket_{uuid.uuid4().hex[:10]}_{photo.filename}"
        photo_path = os.path.join(settings.upload_dir, filename)
        with open(photo_path, "wb") as f:
            f.write(photo_bytes)

    # 1. AI Vision Triage: MobileNetV3 ONNX + Keyword fusion
    full_text = f"{title} {description} {location}"
    vision_cat, vision_conf = classify_defect_image(photo_bytes, full_text)

    # Map categories to required innovation labels
    category_remap = {
        "it_hardware": "oscilloscope" if "bench" in location.lower() or "oscillo" in full_text.lower() else "it_hardware",
        "furniture": "chair/furniture",
        "plumbing": "water/leak",
        "electrical": "electrical",
    }
    clean_category = category_remap.get(vision_cat, vision_cat)

    # 2. Text SBERT embedding (384-d)
    emb = embed_text(full_text, dim=384)

    # 3. Deduplication Check against OPEN tickets at the SAME location
    open_tickets_at_loc = (
        db.query(MaintenanceTicket)
        .filter(
            MaintenanceTicket.tenant_id == user.tenant_id,
            MaintenanceTicket.location == location,
            MaintenanceTicket.status != "Student sign-off",
            MaintenanceTicket.merged_into_id.is_(None),
        )
        .all()
    )

    duplicate_match = None
    highest_sim = 0.0

    for candidate in open_tickets_at_loc:
        if candidate.embedding_json:
            try:
                c_emb = json.loads(candidate.embedding_json)
                sim = cosine_similarity(emb, c_emb)
                if sim >= 0.82 and sim > highest_sim:
                    highest_sim = sim
                    duplicate_match = candidate
            except Exception:
                pass

    now = datetime.now(timezone.utc)

    # CASE A: Duplicate detected (Cosine >= 0.82 at same location) -> Merge!
    if duplicate_match:
        duplicate_match.merged_count += 1
        new_weight = calculate_priority_weight(duplicate_match.vision_category, duplicate_match.merged_count, duplicate_match.created_at, settings.demo_time_multiplier)
        duplicate_match.priority_weight = new_weight

        # Add hash chained audit entry for duplicate merge
        merge_payload = {
            "event": "ticket_merged_as_duplicate",
            "reporter_id": user.id,
            "new_count": duplicate_match.merged_count,
            "similarity": round(highest_sim, 3),
            "new_priority_weight": new_weight,
        }
        append_hash_chained_ledger(db, user.tenant_id, duplicate_match.id, "duplicate_merged", user.id, merge_payload)
        db.commit()

        return {
            "status": "merged",
            "message": f"Your report was semantically matched ({round(highest_sim * 100, 1)}% similarity) to existing ticket #{duplicate_match.id} at {location}. Merged into ticket queue; priority elevated to {new_weight}!",
            "ticket_id": duplicate_match.id,
            "merged_count": duplicate_match.merged_count,
            "similarity": round(highest_sim, 3),
        }

    # CASE B: Unique ticket -> Create new
    sla_category = "hostel" if ("hostel" in location.lower() or "water" in clean_category or "electrical" in clean_category) else "equipment"
    sla_hours = 24 if sla_category == "hostel" else 48
    sla_deadline = now + timedelta(hours=sla_hours)

    # Routing: Lab in-charge for equipment, Warden for hostel
    if sla_category == "hostel":
        warden = db.query(User).filter(User.tenant_id == user.tenant_id, User.role == "warden").first()
        assigned_id = warden.id if warden else None
    else:
        tech = db.query(User).filter(User.tenant_id == user.tenant_id, User.role == "technician").first()
        assigned_id = tech.id if tech else None

    init_weight = calculate_priority_weight(clean_category, 1, now, settings.demo_time_multiplier)

    ticket_id = f"{user.tenant_id}-ticket-{uuid.uuid4().hex[:6]}"
    new_ticket = MaintenanceTicket(
        id=ticket_id,
        tenant_id=user.tenant_id,
        reporter_id=user.id,
        title=title,
        description=description,
        location=location,
        photo_path=photo_path,
        vision_category=clean_category,
        vision_confidence=vision_conf,
        embedding_json=json.dumps(emb),
        merged_count=1,
        assigned_to_id=assigned_id,
        priority=priority,
        priority_weight=init_weight,
        status="Ticket verified",
        sla_category=sla_category,
        sla_deadline=sla_deadline,
        escalation_level=0,
    )
    db.add(new_ticket)
    db.flush()

    # Append root hash-chained ledger row
    init_payload = {
        "event": "ticket_created",
        "reporter_id": user.id,
        "title": title,
        "category": clean_category,
        "confidence": vision_conf,
        "sla_category": sla_category,
        "assigned_to": assigned_id,
    }
    append_hash_chained_ledger(db, user.tenant_id, ticket_id, "ticket_created", user.id, init_payload)
    db.commit()

    return {
        "status": "created",
        "ticket_id": new_ticket.id,
        "vision_category": clean_category,
        "vision_confidence": vision_conf,
        "sla_category": sla_category,
        "sla_deadline": sla_deadline.isoformat(),
        "priority_weight": init_weight,
        "assigned_to": assigned_id,
    }


# --- 3. Status Timeline Progression ---

class StatusUpdateRequest(BaseModel):
    new_status: str  # Ticket verified -> Technician dispatched -> Component replaced -> Student sign-off
    notes: str | None = None
    resolution_photo: str | None = None


@router.patch("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: str,
    payload: StatusUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = db.query(MaintenanceTicket).filter(MaintenanceTicket.id == ticket_id, MaintenanceTicket.tenant_id == user.tenant_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if payload.new_status not in STATUS_TIMELINE:
        raise HTTPException(status_code=400, detail=f"Invalid status: must be one of {STATUS_TIMELINE}")

    old_status = ticket.status
    ticket.status = payload.new_status
    if payload.notes:
        ticket.resolution_notes = payload.notes
    if payload.resolution_photo:
        ticket.resolution_photo = payload.resolution_photo

    # Hash-chained audit ledger entry
    change_payload = {
        "event": "status_transition",
        "old_status": old_status,
        "new_status": payload.new_status,
        "actor_id": user.id,
        "actor_role": user.role,
        "notes": payload.notes,
    }
    append_hash_chained_ledger(db, user.tenant_id, ticket.id, f"status_{payload.new_status.lower().replace(' ', '_')}", user.id, change_payload)
    db.commit()

    return {
        "ticket_id": ticket.id,
        "status": ticket.status,
        "old_status": old_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


# --- 4. Cryptographic Hash-Chained Audit Ledger Verification ---

@router.get("/ledger/verify/{ticket_id}")
def verify_ledger_integrity(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    """
    Cryptographic verification endpoint:
    Walks the append-only hash chain from genesis root ("0"*64) to the latest entry.
    Proves mathematical ledger immutability and flags any tampered row!
    """
    entries = (
        db.query(TicketAuditLedger)
        .filter(TicketAuditLedger.ticket_id == ticket_id)
        .order_by(TicketAuditLedger.id.asc())
        .all()
    )

    if not entries:
        return {"valid": True, "total_records": 0, "message": "No ledger entries found for this ticket."}

    expected_prev = "0" * 64
    for idx, row in enumerate(entries):
        # 1. Check prev_hash links to prior row
        if row.prev_hash != expected_prev:
            return {
                "valid": False,
                "tampered_row_id": row.id,
                "index": idx,
                "message": f"Ledger integrity violation at entry #{row.id}: prev_hash does not match preceding block hash!",
            }

        # 2. Recompute current hash from payload and timestamp
        recomputed = TicketAuditLedger.compute_hash(
            row.prev_hash,
            row.ticket_id,
            row.action,
            row.payload_json,
            row.timestamp,
        )
        if recomputed != row.current_hash:
            return {
                "valid": False,
                "tampered_row_id": row.id,
                "index": idx,
                "message": f"Ledger tampering detected at entry #{row.id}: payload or hash has been altered!",
            }

        expected_prev = row.current_hash

    return {
        "valid": True,
        "total_records": len(entries),
        "latest_block_hash": expected_prev,
        "message": "Ledger integrity verified: cryptographic hash chain is authentic and unbroken.",
    }


# Tamper test endpoint for verification suite
@router.post("/ledger/tamper-test/{ticket_id}")
def tamper_ledger_row(
    ticket_id: str,
    user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db),
):
    """
    Deliberately tampers an audit ledger row to test and demonstrate that
    the cryptographic integrity verification endpoint catches tampering!
    """
    entry = db.query(TicketAuditLedger).filter(TicketAuditLedger.ticket_id == ticket_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="No ledger entry found to tamper")

    entry.payload_json = json.dumps({"tampered": True, "fake_event": "malicious_unauthorized_edit"})
    db.commit()
    return {"status": "tampered", "ticket_id": ticket_id, "row_id": entry.id}
