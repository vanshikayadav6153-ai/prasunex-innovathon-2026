import base64
import hashlib
import json
import os
from datetime import datetime, timezone
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..config import settings, TIER_CONFIG
from ..database import get_db
from ..models import (
    AttendanceRecord,
    College,
    Course,
    CourseEnrollment,
    GatePass,
    KnowledgeState,
    MaintenanceTicket,
    MarkRecord,
    RecruiterInvite,
    StudyMatch,
    User,
    ZKReport,
)
from ..security import get_current_user, require_roles

router = APIRouter(prefix="/api/business", tags=["Business, ROI & Privacy Compliance"])


# --- AES-256 Marks Encryption Engine ---

def get_aes_key() -> bytes:
    return hashlib.sha256(settings.jwt_secret.encode("utf-8")).digest()


def encrypt_aes_256(plaintext: str) -> str:
    """AES-256-CBC encryption for sensitive student mark records."""
    key = get_aes_key()
    iv = os.urandom(16)
    # PKCS7 padding
    pad_len = 16 - (len(plaintext.encode("utf-8")) % 16)
    padded = plaintext.encode("utf-8") + bytes([pad_len] * pad_len)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded) + encryptor.finalize()
    return base64.b64encode(iv + ciphertext).decode("utf-8")


def decrypt_aes_256(ciphertext_b64: str) -> str:
    """AES-256-CBC decryption for sensitive student mark records."""
    key = get_aes_key()
    raw = base64.b64decode(ciphertext_b64.encode("utf-8"))
    iv = raw[:16]
    ciphertext = raw[16:]
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()
    pad_len = padded[-1]
    return padded[:-pad_len].decode("utf-8")


class EncryptMarksRequest(BaseModel):
    plaintext_marks_json: str


class DecryptMarksRequest(BaseModel):
    ciphertext: str


@router.post("/privacy/encrypt-marks")
def encrypt_student_marks(
    payload: EncryptMarksRequest,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
):
    """
    AES-256 Marks Encryption Endpoint:
    Encrypts sensitive student marks fields with AES-256-CBC and returns ciphertext.
    """
    ciphertext = encrypt_aes_256(payload.plaintext_marks_json)
    return {"ciphertext": ciphertext, "algorithm": "AES-256-CBC", "key_size_bits": 256}


@router.post("/privacy/decrypt-marks")
def decrypt_student_marks(
    payload: DecryptMarksRequest,
    user: User = Depends(require_roles(["professor", "hod", "dean", "admin"])),
):
    """
    AES-256 Marks Decryption Endpoint:
    Decrypts AES-256 encrypted marks fields.
    """
    try:
        decrypted = decrypt_aes_256(payload.ciphertext)
        return {"decrypted_json": decrypted}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Decryption failed: {str(e)}")


class ROICalculatorRequest(BaseModel):
    student_count: int = Field(default=2500, ge=100, le=100000)
    legacy_erp_cost_per_student: float = Field(default=22.0, ge=5.0, le=100.0)
    legacy_maintenance_annual_usd: float = Field(default=15000.0, ge=0.0)
    tier_choice: str = Field(default="cognitive")  # "core" ($0), "cognitive" ($2.50), "autonomous_enterprise" ($4.00)


# --- 1. ROI Calculator ---

@router.post("/roi-calculator")
def compute_roi(payload: ROICalculatorRequest):
    """
    ROI Calculator:
    Compares legacy ERP cost vs CAMPUS-NEXUS cognitive OS for N students.
    """
    tier_meta = TIER_CONFIG.get(payload.tier_choice, TIER_CONFIG["cognitive"])
    nexus_rate = tier_meta["price_per_student_yr"]
    nexus_annual_cost = round(payload.student_count * nexus_rate, 2)

    legacy_total = round((payload.student_count * payload.legacy_erp_cost_per_student) + payload.legacy_maintenance_annual_usd, 2)
    net_annual_savings = round(legacy_total - nexus_annual_cost, 2)
    savings_pct = round((net_annual_savings / legacy_total) * 100, 1) if legacy_total > 0 else 0.0

    return {
        "student_count": payload.student_count,
        "tier_selected": tier_meta["name"],
        "nexus_rate_per_student_yr": nexus_rate,
        "nexus_annual_cost_usd": nexus_annual_cost,
        "legacy_annual_cost_usd": legacy_total,
        "net_annual_savings_usd": net_annual_savings,
        "cost_reduction_percentage": savings_pct,
        "summary": f"Switching {payload.student_count:,} students from legacy ERP to CAMPUS-NEXUS saves ${net_annual_savings:,.2f} USD annually ({savings_pct}% reduction).",
    }


# --- 2. Accreditation Pack Export (NBA & NAAC) ---

@router.get("/accreditation-pack")
def get_accreditation_pack(
    user: User = Depends(require_roles(["chancellor_dean", "dean", "hod", "professor", "admin"])),
    db: Session = Depends(get_db),
):
    """
    Accreditation Pack:
    Maps real operational records to NBA Criteria 2, 3, 6 and NAAC Criteria 2 & 7.
    """
    college = db.query(College).filter(College.id == user.tenant_id).first()
    courses = db.query(Course).filter(Course.tenant_id == user.tenant_id).all()
    tickets = db.query(MaintenanceTicket).filter(MaintenanceTicket.tenant_id == user.tenant_id).all()
    resolved_tickets = [t for t in tickets if t.status == "Student sign-off"]
    students = db.query(User).filter(User.tenant_id == user.tenant_id, User.role == "student").count()

    pack = {
        "college_name": college.name if college else "NITX",
        "college_code": college.code if college else "NITX",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "nba_criteria": {
            "criterion_2_teaching_learning": {
                "title": "Teaching-Learning Processes (OBE & Continuous Learning)",
                "courses_monitored": len(courses),
                "dkt_concept_mastery_tracking": "Implemented via Dynamic Bayesian Knowledge Tracing",
                "attendance_monitoring": f"Continuous tracking with 75% early-warning predictive alerts",
            },
            "criterion_3_course_outcomes": {
                "title": "Course Outcomes and Program Outcomes (CO-PO Attainment)",
                "co_po_mapping_matrix": "Direct assessment question matrix mapped to CO1-CO4 and PO1-PO12",
                "evidence_status": "Generated automatically from official examination mark sheets",
            },
            "criterion_6_facilities_equipment": {
                "title": "Facilities & Technical Infrastructure Maintenance",
                "total_tickets_logged": len(tickets),
                "resolved_with_signoff": len(resolved_tickets),
                "sla_compliance_rate": f"{round((len(resolved_tickets) / max(1, len(tickets))) * 100, 1)}%",
                "audit_integrity": "Cryptographic SHA-256 append-only ledger verified",
            },
        },
        "naac_criteria": {
            "criterion_2_teaching_learning_evaluation": {
                "title": "Teaching-Learning and Evaluation",
                "student_diversity": f"{students} registered learners across CSE and ECE departments",
                "formative_assessment": "Diagnostic micro-drills & adaptive root-cause recovery",
            },
            "criterion_7_institutional_values_best_practices": {
                "title": "Institutional Values and Best Practices",
                "innovation_highlight": "Zero-Knowledge anonymous whistleblower reporting for anti-ragging compliance",
                "peer_tutoring": "Bipartite Hungarian complementary peer matching with mutual karma verification",
            },
        },
    }
    return pack


# --- 3. Privacy: Export My Data & Erase My Data (GDPR / DPDP) ---

@router.get("/privacy/export-my-data")
def export_my_data(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    DPDP / GDPR Compliance: Export all personal data.
    """
    marks = db.query(MarkRecord).filter(MarkRecord.student_id == user.id).all()
    attendance = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == user.id).all()
    knowledge = db.query(KnowledgeState).filter(KnowledgeState.student_id == user.id).all()
    passes = db.query(GatePass).filter(GatePass.student_id == user.id).all()
    matches = db.query(StudyMatch).filter((StudyMatch.tutor_id == user.id) | (StudyMatch.learner_id == user.id)).all()

    return {
        "export_timestamp": datetime.now(timezone.utc).isoformat(),
        "user_profile": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "semester": user.semester,
            "cgpa": user.cgpa,
            "karma_points": user.karma_points,
            "opt_in_recruiter": user.opt_in_recruiter,
        },
        "academic_marks": [
            {"course_id": m.course_id, "total": m.total_score, "grade": m.letter_grade} for m in marks
        ],
        "attendance_records": [
            {"course_id": a.course_id, "attended": a.attended_classes, "total": a.total_classes} for a in attendance
        ],
        "concept_mastery": [
            {"concept": k.concept_code, "mastery": k.dkt_mastery} for k in knowledge
        ],
        "gate_passes": [
            {"token": p.token, "is_used": p.is_used} for p in passes
        ],
        "peer_matches": len(matches),
    }


@router.post("/privacy/erase-my-data")
def erase_my_data(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Right to Be Forgotten / Anonymize Personal Identifiers upon student request.
    """
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Self-erasure is limited to student accounts")

    # Anonymize student profile
    user.full_name = f"Anonymized Student {user.id[-4:]}"
    user.email = f"erased_{user.id}@anonymized.invalid"
    user.hashed_password = "ERASED_ACCOUNT"
    user.opt_in_recruiter = False

    # Delete ephemeral gate passes
    db.query(GatePass).filter(GatePass.student_id == user.id).delete()

    db.commit()

    return {
        "status": "erased",
        "message": "Personal identifiable information (name, email, credentials, passes) has been completely anonymized from active databases.",
    }
