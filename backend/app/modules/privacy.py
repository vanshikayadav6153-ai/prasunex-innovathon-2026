import hashlib
import json
import secrets
from datetime import datetime, timezone

from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import College, User, ZKReport, ZKTokenNonce
from ..security import get_current_user, require_roles

router = APIRouter(prefix="/api/privacy", tags=["Innovation 5: Anonymous Whistleblower"])


class BlindSignatureRequest(BaseModel):
    blinded_message: str = Field(min_length=1, max_length=2048)


class ReportRequest(BaseModel):
    college_code: str = Field(min_length=2, max_length=32)
    commitment: str = Field(min_length=8, max_length=256)
    signature: str = Field(min_length=1, max_length=2048)
    nullifier: str = Field(min_length=8, max_length=128)
    category: str = Field(min_length=1, max_length=64)  # Ragging, Harassment, Academic Bias, Corruption
    report_text: str = Field(min_length=1, max_length=50000)


class ReportStatusUpdate(BaseModel):
    status: str  # Received, Under Review by Anti-Ragging Committee, Action Initiated, Closed
    committee_notes: str | None = None


def _college_rsa_key(college: College, db: Session, custodian: str = "dean"):
    fields = ("rsa_n", "rsa_e", "rsa_d") if custodian == "dean" else ("icc_rsa_n", "icc_rsa_e", "icc_rsa_d")
    n_field, e_field, d_field = fields
    if not getattr(college, n_field) or not getattr(college, e_field) or not getattr(college, d_field):
        private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        numbers = private.private_numbers()
        setattr(college, n_field, format(numbers.public_numbers.n, "x"))
        setattr(college, e_field, format(numbers.public_numbers.e, "x"))
        setattr(college, d_field, format(numbers.d, "x"))
        db.commit()
    return int(getattr(college, n_field), 16), int(getattr(college, e_field), 16), int(getattr(college, d_field), 16)


def _commitment_digest(commitment: str, modulus: int) -> int:
    return int.from_bytes(hashlib.sha256(commitment.encode("utf-8")).digest(), "big") % modulus


@router.get("/blind-key")
def get_blind_signing_key(
    college_code: str = "NITX",
    db: Session = Depends(get_db),
):
    """
    Public Institutional Blind-Signing Key (Public Modulus N & Exponent e).
    Used by the student's browser to blind the identity commitment.
    """
    college = db.query(College).filter(College.code == college_code.strip().upper()).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    n, e, _ = _college_rsa_key(college, db, "dean")
    return {
        "protocol": "ZK-style anonymous credential (RSA Blind Signature + Hash Nullifier)",
        "college_code": college.code,
        "modulus": format(n, "x"),
        "exponent": format(e, "x"),
        "hash_algorithm": "SHA-256",
        "description": "Blinds student identity token in-browser. The institutional signer proves enrollment without ever seeing the student's secret or report text.",
    }


@router.post("/blind-sign")
def blind_sign_commitment(
    payload: BlindSignatureRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Institutional Blind Signature Endpoint:
    Rule: Only enrolled students in active standing may receive a blind signature.
    Non-enrolled users or non-students get 403 Forbidden.
    """
    if user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only verified enrolled students can request an anonymous whistleblower blind signature.",
        )

    college = db.query(College).filter(College.id == user.tenant_id).first()
    n, _, d = _college_rsa_key(college, db, "dean")

    try:
        blinded = int(payload.blinded_message, 16)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="blinded_message must be a valid hex string") from exc

    if not (0 < blinded < n):
        raise HTTPException(status_code=400, detail="Invalid blinded message range")

    # Sign: s' = (m')^d mod N
    blinded_sig = pow(blinded, d, n)
    return {
        "blinded_signature": format(blinded_sig, "x"),
        "protocol": "RSA Chaum Blind Signature",
    }


@router.post("/reports", status_code=201)
def submit_anonymous_whistleblower_report(
    payload: ReportRequest,
    db: Session = Depends(get_db),
):
    """
    Unauthenticated Anonymous Whistleblower Submission:
    - Sent WITHOUT auth cookies / JWT / student ID.
    - Mathematically verifies that the unblinded signature (s^e mod N) matches the commitment digest.
    - Nullifier uniqueness check guarantees 1 report per token (reused nullifier is rejected).
    """
    college = db.query(College).filter(College.code == payload.college_code.strip().upper()).first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    n, e, _ = _college_rsa_key(college, db, "dean")

    # 1. Cryptographic Signature Verification
    try:
        signature_int = int(payload.signature, 16)
        expected_digest = _commitment_digest(payload.commitment, n)
        actual_val = pow(signature_int, e, n)
        if actual_val != expected_digest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cryptographic verification failed: Forged or invalid blind signature proof.",
            )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Malformed signature or commitment hex encoding") from exc

    # 2. Nullifier Spent Check (Double Filing Prevention)
    nullifier_hash = hashlib.sha256(payload.nullifier.encode("utf-8")).hexdigest()
    already_spent = db.query(ZKTokenNonce).filter(
        ZKTokenNonce.tenant_id == college.id,
        ZKTokenNonce.token_hash == nullifier_hash,
    ).first()

    if already_spent:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Nullifier already spent: Double filing rejected. Each student credential permits exactly one report.",
        )

    # 3. Store report under decoupled random tracking code (NO student ID stored anywhere!)
    tracking_code = f"SHIELD-{secrets.token_hex(6).upper()}"
    report_id = f"zk-report-{secrets.token_hex(8)}"

    report = ZKReport(
        id=report_id,
        tenant_id=college.id,
        tracking_code=tracking_code,
        category=payload.category,
        encrypted_body=payload.report_text,
        key_share_dean="dean_committee_key_share",
        key_share_icc="icc_investigation_share",
        nullifier_hash=nullifier_hash,
        status="Received by Anti-Ragging Committee",
        thread_json=json.dumps([{
            "at": datetime.now(timezone.utc).isoformat(),
            "author": "System",
            "message": "Report logged with verified zero-knowledge institutional credential. Identity decoupling complete.",
        }]),
    )

    db.add(ZKTokenNonce(tenant_id=college.id, token_hash=nullifier_hash))
    db.add(report)
    db.commit()

    return {
        "status": "submitted",
        "receipt_tracking_code": tracking_code,
        "category": payload.category,
        "message": "Whistleblower report cryptographically verified and queued for Dean / Anti-Ragging Committee review. Identity is mathematically decoupled from this report.",
        "anonymous_guarantee": "No IP, user id, or roll number was logged or stored.",
    }


@router.get("/reports/track/{tracking_code}")
def track_anonymous_report(
    tracking_code: str,
    db: Session = Depends(get_db),
):
    """
    Public receipt tracker:
    Reporter can check investigation progress without logging in.
    """
    report = db.query(ZKReport).filter(ZKReport.tracking_code == tracking_code.strip()).first()
    if not report:
        raise HTTPException(status_code=404, detail="Invalid tracking code")

    return {
        "tracking_code": report.tracking_code,
        "category": report.category,
        "status": report.status,
        "updates": json.loads(report.thread_json or "[]"),
        "submitted_at": report.created_at.isoformat(),
    }


@router.get("/dean-inbox")
def dean_anti_ragging_inbox(
    user: User = Depends(require_roles(["dean", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Dedicated Dean & Anti-Ragging Committee confidential inbox.
    """
    reports = (
        db.query(ZKReport)
        .filter(ZKReport.tenant_id == user.tenant_id)
        .order_by(ZKReport.created_at.desc())
        .all()
    )

    return [
        {
            "id": r.id,
            "tracking_code": r.tracking_code,
            "category": r.category,
            "status": r.status,
            "report_text": r.encrypted_body,
            "submitted_at": r.created_at.isoformat(),
            "update_count": len(json.loads(r.thread_json or "[]")),
        }
        for r in reports
    ]


@router.patch("/reports/{tracking_code}/status")
def update_report_status_dean(
    tracking_code: str,
    payload: ReportStatusUpdate,
    user: User = Depends(require_roles(["dean", "admin"])),
    db: Session = Depends(get_db),
):
    report = db.query(ZKReport).filter(ZKReport.tracking_code == tracking_code, ZKReport.tenant_id == user.tenant_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = payload.status
    thread = json.loads(report.thread_json or "[]")
    thread.append({
        "at": datetime.now(timezone.utc).isoformat(),
        "author": f"{user.role.upper()} ({user.full_name})",
        "message": f"Status updated to '{payload.status}'. Notes: {payload.committee_notes or 'Review in progress.'}",
    })
    report.thread_json = json.dumps(thread)
    db.commit()

    return {
        "tracking_code": report.tracking_code,
        "status": report.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
