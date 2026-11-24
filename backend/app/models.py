"""
CAMPUS-NEXUS v2 — Phase 05 Complete PostgreSQL Schema
======================================================
Nine required v2 models + comprehensive relational supporting models.
Designed for PostgreSQL 16 + pgvector with SQLite fallback for local dev.

PRIVACY DESIGN DECISIONS:
- zk_group_members stores (group_id, identity_commitment) with NO user_id column.
  There is NO table or column that maps a user to their identity commitment or nullifier.
- grievance_tickets.nullifier is unique per proof scope; no FK to users.
- Sensitive fields are marked with `info={"sensitive": True}` in column metadata.
- All tables carry tenant_id for row-level security / multi-tenant isolation.

AUDIT: audit_events is append-only; no UPDATE or DELETE allowed by application code.
"""

from datetime import datetime, timezone
from typing import Any
import hashlib
import json

from sqlalchemy import (
    BigInteger, Boolean, CheckConstraint, Column, DateTime, Enum, Float,
    ForeignKey, ForeignKeyConstraint, Index, Integer, LargeBinary,
    Numeric, String, Text, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator

from .database import Base

# ---------------------------------------------------------------------------
# pgvector support — graceful fallback to Text on SQLite
# ---------------------------------------------------------------------------
try:
    from pgvector.sqlalchemy import Vector as PgVector
    _PGVECTOR_AVAILABLE = True
except ImportError:
    _PGVECTOR_AVAILABLE = False


class Vector384(TypeDecorator):
    """384-dimensional vector column.  Uses pgvector on Postgres, Text/JSON on SQLite."""
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql" and _PGVECTOR_AVAILABLE:
            return dialect.type_descriptor(PgVector(384))
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql" and _PGVECTOR_AVAILABLE:
            return value  # pgvector handles list/ndarray natively
        return json.dumps(value if isinstance(value, list) else list(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):
            return json.loads(value)
        return value


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def utcnow():
    return datetime.now(timezone.utc)


# ============================================================================
# 1. INSTITUTION & TENANT
# ============================================================================

class Institution(Base):
    """Top-level institution / college tenant."""
    __tablename__ = "institutions"

    id = Column(String(64), primary_key=True)
    name = Column(String(200), nullable=False)
    code = Column(String(32), unique=True, nullable=False)
    domain = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    tier = Column(String(40), nullable=False, default="pilot")  # pilot, core, plus, university
    student_cap = Column(Integer, nullable=False, default=500)
    rsa_public_key = Column(Text, nullable=True, info={"sensitive": True})
    icc_rsa_public_key = Column(Text, nullable=True, info={"sensitive": True})
    config_json = Column(Text, nullable=False, default="{}")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("student_cap > 0", name="ck_institution_student_cap_positive"),
    )


# Legacy alias — keeps existing code working
class College(Base):
    """Legacy college table preserved for backward compatibility."""
    __tablename__ = "colleges"

    id = Column(String(64), primary_key=True)
    name = Column(String(200), nullable=False)
    code = Column(String(32), unique=True, nullable=False)
    tier = Column(String(40), nullable=False, default="core")
    student_count = Column(Integer, nullable=False, default=100)
    rsa_n = Column(Text, nullable=True, info={"sensitive": True})
    rsa_e = Column(Text, nullable=True, info={"sensitive": True})
    rsa_d = Column(Text, nullable=True, info={"sensitive": True})
    icc_rsa_n = Column(Text, nullable=True, info={"sensitive": True})
    icc_rsa_e = Column(Text, nullable=True, info={"sensitive": True})
    icc_rsa_d = Column(Text, nullable=True, info={"sensitive": True})
    created_at = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 2. USERS — no zk_enrollment_hash per spec
# ============================================================================

class User(Base):
    """
    User account. Intentionally does NOT contain zk_enrollment_hash.
    Identity commitments live in zk_group_members with NO user_id link.
    """
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    email = Column(String(200), nullable=False, info={"sensitive": True})
    hashed_password = Column(String(256), nullable=False, info={"sensitive": True})
    full_name = Column(String(160), nullable=False)
    role = Column(String(40), nullable=False)  # student, professor, hod, dean, technician, warden, admin, recruiter
    department = Column(String(80), nullable=False, default="CSE")
    semester = Column(Integer, nullable=False, default=5)
    cgpa = Column(Float, nullable=False, default=8.0)
    karma_points = Column(Integer, nullable=False, default=0)
    opt_in_recruiter = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    __table_args__ = (
        Index("ix_users_email_tenant", "email", "tenant_id", unique=True),
    )

    # Aliases for specification consistency
    @property
    def name(self) -> str:
        return self.full_name

    @name.setter
    def name(self, val: str):
        self.full_name = val

    @property
    def passwordHash(self) -> str:
        return self.hashed_password

    @passwordHash.setter
    def passwordHash(self, val: str):
        self.hashed_password = val

    @property
    def createdAt(self):
        return self.created_at


# ============================================================================
# 3. ZK GROUP MEMBERS — absolutely NO user_id
# ============================================================================

class ZKGroupMember(Base):
    """
    Zero-knowledge group membership registry.
    Stores (group_id, identity_commitment) with absolutely NO user_id.

    PRIVACY ASSUMPTIONS:
    - Identity commitments are cryptographic hashes; they do NOT reveal the user.
    - The enrollment process MUST be designed so the server never learns which user
      produced which commitment. See docs/ARCHITECTURE_DECISIONS.md.
    - There is NO table or join path linking a user to their commitment.
    """
    __tablename__ = "zk_group_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    group_id = Column(String(64), nullable=False, index=True)
    identity_commitment = Column(String(128), nullable=False)
    enrolled_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("group_id", "identity_commitment", name="uq_zk_group_commitment"),
        Index("ix_zk_group_id", "group_id"),
    )


# ============================================================================
# 4. GRIEVANCE TICKETS — nullifier unique per proof scope, NO user link
# ============================================================================

class GrievanceTicket(Base):
    """
    Sensitive grievance (ragging / harassment / bias).
    nullifier is unique per (tenant_id, proof_scope) — prevents double-submit
    without revealing identity.
    """
    __tablename__ = "grievance_tickets"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    is_sensitive = Column(Boolean, nullable=False, default=True)
    proof_scope = Column(String(128), nullable=False, default="default")
    nullifier = Column(String(128), nullable=False)
    target_tag = Column(String(200), nullable=True)  # category / target descriptor
    encrypted_body = Column(Text, nullable=False, info={"sensitive": True})
    encrypted_attachment_ref = Column(String(500), nullable=True, info={"sensitive": True})
    key_share_dean = Column(Text, nullable=True, info={"sensitive": True})
    key_share_icc = Column(Text, nullable=True, info={"sensitive": True})
    status = Column(String(32), nullable=False, default="submitted")  # submitted, under_review, escalated, resolved, dismissed
    escalation_level = Column(Integer, nullable=False, default=0)  # 0=none, 1=committee, 2=HoD, 3=Dean
    tracking_code = Column(String(32), unique=True, nullable=False)
    committee_notes_json = Column(Text, nullable=False, default="[]", info={"sensitive": True})
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    ttl_expires_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("tenant_id", "proof_scope", "nullifier", name="uq_grievance_nullifier_scope"),
        CheckConstraint("escalation_level >= 0 AND escalation_level <= 3", name="ck_grievance_escalation_range"),
    )


# ============================================================================
# 5. COURSE, COHORT & ENROLLMENT
# ============================================================================

class Course(Base):
    __tablename__ = "courses"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    code = Column(String(32), nullable=False)
    title = Column(String(200), nullable=False)
    credits = Column(Integer, nullable=False, default=4)
    department = Column(String(80), nullable=False, default="CSE")
    semester = Column(Integer, nullable=False, default=5)
    professor_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    syllabus_text = Column(Text, nullable=True)
    co_po_config_json = Column(Text, nullable=False, default="{}")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        UniqueConstraint("tenant_id", "code", name="uq_course_code_tenant"),
    )


class Cohort(Base):
    """A batch/section of students for a course in a given term."""
    __tablename__ = "cohorts"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    name = Column(String(80), nullable=False, default="Section A")
    term = Column(String(32), nullable=False, default="2026-odd")  # e.g., 2026-odd, 2026-even
    year = Column(Integer, nullable=False, default=2026)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        UniqueConstraint("tenant_id", "course_id", "name", "term", name="uq_cohort_identity"),
    )


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    cohort_id = Column(String(64), ForeignKey("cohorts.id"), nullable=True, index=True)
    semester = Column(Integer, nullable=False, default=5)
    attendance_percentage = Column(Float, nullable=False, default=80.0)
    final_grade = Column(String(8), nullable=True)
    enrolled_at = Column(DateTime(timezone=True), default=utcnow)
    dropped_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("course_id", "student_id", name="uq_enrollment_course_student"),
    )


# ============================================================================
# 6. ASSESSMENTS & QUESTIONS — concept_id, bloom_level, max_marks, co_id
# ============================================================================

class Assessment(Base):
    """An exam / quiz / assignment container."""
    __tablename__ = "assessments"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    assessment_type = Column(String(32), nullable=False, default="exam")  # exam, quiz, assignment, lab
    total_marks = Column(Float, nullable=False, default=100.0)
    duration_minutes = Column(Integer, nullable=True)
    is_published = Column(Boolean, nullable=False, default=False)
    created_by = Column(String(64), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        CheckConstraint("total_marks > 0", name="ck_assessment_total_marks_positive"),
    )


class AssessmentQuestion(Base):
    """
    v2 required: concept_id, bloom_level, max_marks, co_id
    """
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    assessment_id = Column(String(64), ForeignKey("assessments.id"), nullable=True, index=True)
    q_code = Column(String(32), nullable=False)
    prompt = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False, default="[]")
    correct_idx = Column(Integer, nullable=False, default=0)
    # v2 required fields
    concept_id = Column(String(40), nullable=True)   # FK-like ref to concept_nodes.concept_code
    concept_code = Column(String(40), nullable=False)  # backward compat
    co_id = Column(String(16), nullable=True)         # course outcome ID (alias)
    co_code = Column(String(16), nullable=False, default="CO1")
    bloom_level = Column(String(16), nullable=False, default="L2")
    po_codes_json = Column(Text, nullable=False, default='["PO1","PO2"]')
    max_marks = Column(Float, nullable=False, default=10.0)
    irt_b = Column(Float, nullable=False, default=0.0)   # difficulty
    irt_a = Column(Float, nullable=False, default=1.0)   # discrimination
    is_active = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        CheckConstraint("max_marks > 0", name="ck_question_max_marks_positive"),
        Index("ix_question_course_concept", "course_id", "concept_code"),
    )


class QuestionResponse(Base):
    """Individual student response to a question."""
    __tablename__ = "question_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("assessment_questions.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    selected_option = Column(Integer, nullable=True)
    free_text_answer = Column(Text, nullable=True)
    marks_awarded = Column(Float, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    answered_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        UniqueConstraint("question_id", "student_id", name="uq_response_question_student"),
    )


# ============================================================================
# 7. MARKS RECORDS & IMPORTS
# ============================================================================

class MarkRecord(Base):
    __tablename__ = "mark_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    assessment_id = Column(String(64), ForeignKey("assessments.id"), nullable=True, index=True)
    question_scores_json = Column(Text, nullable=False, default="{}")
    total_score = Column(Float, nullable=False, default=0.0)
    z_score = Column(Float, nullable=False, default=0.0)
    letter_grade = Column(String(8), nullable=False, default="B")
    encrypted_marks = Column(Text, nullable=True, info={"sensitive": True})
    import_id = Column(String(64), ForeignKey("marks_imports.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class MarksImport(Base):
    """Tracks CSV/photo bulk marks ingestion events."""
    __tablename__ = "marks_imports"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    imported_by = Column(String(64), ForeignKey("users.id"), nullable=False)
    source_type = Column(String(16), nullable=False, default="csv")  # csv, xlsx, photo
    source_file_ref = Column(String(500), nullable=True)  # encrypted storage reference
    checksum = Column(String(128), nullable=True)
    row_count = Column(Integer, nullable=False, default=0)
    error_count = Column(Integer, nullable=False, default=0)
    status = Column(String(24), nullable=False, default="pending")  # pending, reviewing, confirmed, rejected
    confirmed_by = Column(String(64), ForeignKey("users.id"), nullable=True)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 8. CONCEPT DAG
# ============================================================================

class ConceptNode(Base):
    __tablename__ = "concept_nodes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    concept_code = Column(String(40), nullable=False)
    name = Column(String(160), nullable=False)
    prereq_codes_json = Column(Text, nullable=False, default="[]")
    bloom_level = Column(String(16), nullable=True)
    weight = Column(Float, nullable=False, default=1.0)

    __table_args__ = (
        UniqueConstraint("course_id", "concept_code", name="uq_concept_course_code"),
    )


class ConceptEdge(Base):
    """Explicit prerequisite edge for the concept DAG."""
    __tablename__ = "concept_edges"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    from_concept_code = Column(String(40), nullable=False)
    to_concept_code = Column(String(40), nullable=False)

    __table_args__ = (
        UniqueConstraint("course_id", "from_concept_code", "to_concept_code", name="uq_concept_edge"),
    )


# ============================================================================
# 9. REVIEW CARDS (FSRS) — concept_id, stability, last_review, next_due
# ============================================================================

class ReviewCard(Base):
    """
    v2 required: concept_id, stability, last_review, next_due
    FSRS-style spaced-repetition card per student×concept.
    """
    __tablename__ = "review_cards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    concept_id = Column(String(40), nullable=False)   # maps to concept_code
    question_id = Column(Integer, ForeignKey("assessment_questions.id"), nullable=True)
    stability = Column(Float, nullable=False, default=1.0)
    difficulty = Column(Float, nullable=False, default=0.5)
    last_review = Column(DateTime(timezone=True), nullable=True)
    next_due = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    reps = Column(Integer, nullable=False, default=0)
    lapses = Column(Integer, nullable=False, default=0)
    state = Column(String(16), nullable=False, default="new")  # new, learning, review, relearning
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", "concept_id", name="uq_review_card_student_concept"),
        Index("ix_review_card_next_due", "student_id", "next_due"),
        CheckConstraint("stability > 0", name="ck_review_card_stability_positive"),
    )


# ============================================================================
# 10. EXAM SCHEDULE — room_id, invigilator_id, rollback_version
# ============================================================================

class ExamSchedule(Base):
    """
    v2 required: room_id, invigilator_id, rollback_version
    CP-SAT solver output for exam timetabling.
    """
    __tablename__ = "exam_schedules"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    assessment_id = Column(String(64), ForeignKey("assessments.id"), nullable=True)
    room_id = Column(String(64), nullable=False)
    invigilator_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    exam_date = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False, default=180)
    rollback_version = Column(Integer, nullable=False, default=1)
    solver_status = Column(String(24), nullable=False, default="draft")  # draft, feasible, optimal, published
    conflict_json = Column(Text, nullable=False, default="[]")
    approved_by = Column(String(64), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    __table_args__ = (
        CheckConstraint("rollback_version >= 1", name="ck_exam_rollback_version_min"),
        CheckConstraint("duration_minutes > 0", name="ck_exam_duration_positive"),
        Index("ix_exam_schedule_date_room", "exam_date", "room_id"),
    )


# ============================================================================
# 11. ATTENDANCE SCANS — device_hash, timestamp, geofence_status, anomaly_score
# ============================================================================

class AttendanceScan(Base):
    """
    v2 required: device_hash, timestamp, geofence_status, anomaly_score
    Per-scan record from rotating QR attendance.
    """
    __tablename__ = "attendance_scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    device_hash = Column(String(128), nullable=False, info={"sensitive": True})
    scanned_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    geofence_status = Column(String(24), nullable=False, default="unknown")  # inside, outside, unknown
    anomaly_score = Column(Float, nullable=False, default=0.0)
    qr_token_hash = Column(String(128), nullable=True)
    is_valid = Column(Boolean, nullable=False, default=True)
    review_status = Column(String(24), nullable=False, default="auto_accepted")  # auto_accepted, flagged, reviewed_ok, rejected

    __table_args__ = (
        CheckConstraint("anomaly_score >= 0 AND anomaly_score <= 1", name="ck_scan_anomaly_range"),
        Index("ix_scan_session_student", "session_id", "student_id"),
    )


# Legacy attendance aggregate
class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    attended_classes = Column(Integer, nullable=False, default=0)
    total_classes = Column(Integer, nullable=False, default=0)
    remaining_classes = Column(Integer, nullable=False, default=15)
    updated_at = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 12. EQUIPMENT — installed_at, maintenance_logs, weibull_k, weibull_lambda
# ============================================================================

class Equipment(Base):
    """
    v2 required: installed_at, maintenance_logs, weibull_k, weibull_lambda
    Facilities asset registry with Weibull survival parameters.
    """
    __tablename__ = "equipment"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    asset_tag = Column(String(64), nullable=True)
    category = Column(String(64), nullable=False, default="general")
    location = Column(String(200), nullable=False, default="Unknown")
    manufacturer = Column(String(120), nullable=True)
    model_number = Column(String(120), nullable=True)
    installed_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    maintenance_logs = Column(Text, nullable=False, default="[]")  # JSON array of service events
    weibull_k = Column(Float, nullable=True)      # shape parameter
    weibull_lambda = Column(Float, nullable=True)  # scale parameter (days)
    last_service_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(24), nullable=False, default="operational")  # operational, degraded, failed, retired
    photo_ref = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    __table_args__ = (
        CheckConstraint("weibull_k IS NULL OR weibull_k > 0", name="ck_equipment_weibull_k_positive"),
        CheckConstraint("weibull_lambda IS NULL OR weibull_lambda > 0", name="ck_equipment_weibull_lambda_positive"),
        Index("ix_equipment_tenant_location", "tenant_id", "location"),
    )


class MaintenanceEvent(Base):
    """Service / repair event for equipment."""
    __tablename__ = "maintenance_events"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    equipment_id = Column(String(64), ForeignKey("equipment.id"), nullable=False, index=True)
    event_type = Column(String(32), nullable=False, default="repair")  # repair, inspection, replacement, calibration
    description = Column(Text, nullable=True)
    performed_by = Column(String(64), ForeignKey("users.id"), nullable=True)
    cost = Column(Numeric(10, 2), nullable=True)
    is_failure = Column(Boolean, nullable=False, default=False)
    event_date = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 13. EVENTS — OCR content, embeddings, faculty_approval_flag
# ============================================================================

class Event(Base):
    """
    v2 required: OCR content, embeddings, faculty_approval_flag
    Campus events / notices parsed from posters/text.
    """
    __tablename__ = "events"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    category = Column(String(64), nullable=False, default="general")  # hackathon, scholarship, fest, seminar, notice
    organizer = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    ocr_content = Column(Text, nullable=True)   # raw OCR-extracted text
    ocr_confidence = Column(Float, nullable=True)
    embedding = Column(Vector384(), nullable=True)
    faculty_approval_flag = Column(Boolean, nullable=False, default=False)
    approved_by = Column(String(64), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    source_poster_ref = Column(String(500), nullable=True)  # encrypted storage ref
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    registration_deadline = Column(DateTime(timezone=True), nullable=True)
    location = Column(String(200), nullable=True)
    eligibility = Column(Text, nullable=True)
    external_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    __table_args__ = (
        Index("ix_event_tenant_category", "tenant_id", "category"),
    )


# ============================================================================
# 14. KNOWLEDGE STATE (DKT)
# ============================================================================

class KnowledgeState(Base):
    __tablename__ = "knowledge_states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    concept_code = Column(String(40), nullable=False)
    bkt_mastery = Column(Float, nullable=False, default=0.5)
    dkt_mastery = Column(Float, nullable=False, default=0.5)
    attempts = Column(Integer, nullable=False, default=0)
    correct_count = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", "concept_code", name="uq_knowledge_state"),
    )


# ============================================================================
# 15. STUDY PLANS
# ============================================================================

class StudyPlan(Base):
    """Container for a student's what-if / study optimization session."""
    __tablename__ = "study_plans"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    total_weekly_hours = Column(Float, nullable=False, default=20.0)
    allocation_json = Column(Text, nullable=False, default="{}")  # {course_id: hours}
    projected_gpa = Column(Float, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class StudyPlanItem(Base):
    __tablename__ = "study_plan_items"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    plan_id = Column(String(64), ForeignKey("study_plans.id"), nullable=True)
    concept_code = Column(String(40), nullable=False)
    scheduled_date = Column(String(10), nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False, default=25)
    activity = Column(String(240), nullable=False)
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 16. MAINTENANCE / FACILITIES TICKETS & DEDUP GROUPS
# ============================================================================

class MaintenanceTicket(Base):
    __tablename__ = "maintenance_tickets"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    reporter_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(160), nullable=False, default="Lab 2 - Bench 14")
    asset_id = Column(String(64), ForeignKey("equipment.id"), nullable=True, index=True)
    photo_path = Column(String(300), nullable=True)
    vision_category = Column(String(64), nullable=False, default="general")
    vision_confidence = Column(Float, nullable=False, default=0.0)
    embedding = Column(Vector384(), nullable=True)
    embedding_json = Column(Text, nullable=False, default="[]")
    dedup_group_id = Column(String(64), ForeignKey("dedup_groups.id"), nullable=True, index=True)
    merged_into_id = Column(String(64), nullable=True)
    merged_count = Column(Integer, nullable=False, default=1)
    assigned_to_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    priority = Column(String(24), nullable=False, default="Medium")
    priority_weight = Column(Float, nullable=False, default=1.0)
    status = Column(String(32), nullable=False, default="Ticket verified")
    sla_category = Column(String(32), nullable=False, default="equipment")
    sla_deadline = Column(DateTime(timezone=True), nullable=False)
    escalation_level = Column(Integer, nullable=False, default=0)
    resolution_notes = Column(Text, nullable=True)
    resolution_photo = Column(String(300), nullable=True)
    audit_ledger_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class DedupGroup(Base):
    """SBERT-based duplicate ticket group."""
    __tablename__ = "dedup_groups"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    canonical_ticket_id = Column(String(64), nullable=True)
    similarity_threshold = Column(Float, nullable=False, default=0.82)
    reporter_count = Column(Integer, nullable=False, default=1)
    merged_at = Column(DateTime(timezone=True), default=utcnow)
    is_active = Column(Boolean, nullable=False, default=True)


class TicketAuditLedger(Base):
    __tablename__ = "ticket_audit_ledger"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    ticket_id = Column(String(64), ForeignKey("maintenance_tickets.id"), nullable=False, index=True)
    action = Column(String(64), nullable=False)
    actor_id = Column(String(64), nullable=True)
    prev_hash = Column(String(64), nullable=False, default="0" * 64)
    current_hash = Column(String(64), nullable=False)
    payload_json = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow)

    @classmethod
    def compute_hash(cls, prev_hash: str, ticket_id: str, action: str, payload_json: str, ts: Any = None) -> str:
        if isinstance(ts, datetime):
            ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
        elif ts is not None:
            ts_str = str(ts)[:19].replace("T", " ")
        else:
            ts_str = ""
        raw = f"{prev_hash}|{ticket_id}|{action}|{payload_json}|{ts_str}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()


# ============================================================================
# 17. PEER MATCHING
# ============================================================================

class PeerPreference(Base):
    """Student preferences for peer study matching."""
    __tablename__ = "peer_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False)
    opted_in = Column(Boolean, nullable=False, default=True)
    availability_json = Column(Text, nullable=False, default="[]")  # time slots
    goals = Column(Text, nullable=True)
    blocked_students_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="uq_peer_pref_student_course"),
    )


class StudyMatch(Base):
    __tablename__ = "study_matches"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False)
    concept_code = Column(String(40), nullable=False)
    tutor_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    learner_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=False, default=0.0)
    status = Column(String(24), nullable=False, default="Active")
    tutor_confirmed = Column(Boolean, nullable=False, default=False)
    learner_confirmed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 18. NOTICES, ASSETS, DOCUMENT CHUNKS
# ============================================================================

class Notice(Base):
    """Official campus notice / circular."""
    __tablename__ = "notices"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    body = Column(Text, nullable=True)
    category = Column(String(64), nullable=False, default="general")
    issued_by = Column(String(64), ForeignKey("users.id"), nullable=True)
    is_published = Column(Boolean, nullable=False, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Asset(Base):
    """Encrypted file storage reference (documents, images, attachments)."""
    __tablename__ = "assets"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    file_name = Column(String(300), nullable=False)
    content_type = Column(String(100), nullable=True)
    storage_ref = Column(String(500), nullable=False, info={"sensitive": True})  # encrypted object storage path
    encryption_key_ref = Column(String(200), nullable=True, info={"sensitive": True})
    size_bytes = Column(BigInteger, nullable=True)
    checksum_sha256 = Column(String(64), nullable=True)
    uploaded_by = Column(String(64), ForeignKey("users.id"), nullable=True)
    access_level = Column(String(24), nullable=False, default="private")  # private, course, tenant
    ttl_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class DocumentChunk(Base):
    """RAG document chunk for syllabus copilot (pgvector embeddings)."""
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=True, index=True)
    asset_id = Column(String(64), ForeignKey("assets.id"), nullable=True)
    chunk_index = Column(Integer, nullable=False, default=0)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    section_title = Column(String(200), nullable=True)
    embedding = Column(Vector384(), nullable=True)
    version = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        Index("ix_doc_chunk_course_version", "course_id", "version"),
    )


# ============================================================================
# 19. TIMETABLE & SYLLABUS
# ============================================================================

class TimetableEntry(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    day_of_week = Column(String(16), nullable=False)
    start_time = Column(String(10), nullable=False)
    end_time = Column(String(10), nullable=False)
    room = Column(String(64), nullable=False, default="Hall-A")
    professor_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    is_cancelled = Column(Boolean, nullable=False, default=False)
    rescheduled_info = Column(String(160), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow)


class SyllabusTopic(Base):
    __tablename__ = "syllabus_topics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    topic_title = Column(String(200), nullable=False)
    order_index = Column(Integer, nullable=False, default=1)
    is_covered = Column(Boolean, nullable=False, default=False)
    covered_at = Column(DateTime(timezone=True), nullable=True)


# ============================================================================
# 20. ZK REPORTS (legacy) & TOKEN NONCES
# ============================================================================

class ZKReport(Base):
    __tablename__ = "zk_reports"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    tracking_code = Column(String(32), unique=True, nullable=False)
    category = Column(String(64), nullable=False)
    encrypted_body = Column(Text, nullable=False, info={"sensitive": True})
    key_share_dean = Column(Text, nullable=False, info={"sensitive": True})
    key_share_icc = Column(Text, nullable=False, info={"sensitive": True})
    nullifier_hash = Column(String(128), unique=True, nullable=True)
    status = Column(String(32), nullable=False, default="Submitted")
    thread_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ZKTokenNonce(Base):
    __tablename__ = "zk_token_nonces"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    token_hash = Column(String(128), unique=True, nullable=False)
    used_at = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 21. HACKATHON, SQUADS, GATEPASSES, RECRUITER
# ============================================================================

class HackathonEvent(Base):
    __tablename__ = "hackathon_events"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    organizer = Column(String(120), nullable=False)
    deadline = Column(String(32), nullable=False)
    source = Column(String(40), nullable=False, default="Seeded")
    tags_json = Column(Text, nullable=False, default="[]")
    teams_json = Column(Text, nullable=False, default="[]")


class SquadRequest(Base):
    __tablename__ = "squad_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    event_id = Column(String(64), nullable=False)
    skills_json = Column(Text, nullable=False, default="[]")
    preferred_role = Column(String(64), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class GatePass(Base):
    __tablename__ = "gate_passes"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    event_id = Column(String(64), ForeignKey("hackathon_events.id"), nullable=False)
    token = Column(String(64), unique=True, nullable=False)
    qr_code_svg = Column(Text, nullable=True)
    is_used = Column(Boolean, nullable=False, default=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class RecruiterInvite(Base):
    __tablename__ = "recruiter_invites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    recruiter_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    role_title = Column(String(160), nullable=False)
    ctc_lpa = Column(Float, nullable=False, default=12.0)
    message = Column(Text, nullable=False)
    status = Column(String(24), nullable=False, default="Sent")
    created_at = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 22. GRADE CHANGE LEDGER (append-only)
# ============================================================================

class GradeChangeLedger(Base):
    __tablename__ = "grade_change_ledger"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False)
    actor_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    action = Column(String(64), nullable=False)
    before_json = Column(Text, nullable=False)
    after_json = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow)


# ============================================================================
# 23. BILLING PLANS & SUBSCRIPTIONS
# ============================================================================

class BillingPlan(Base):
    """Service tiers: Pilot (free), Core ₹250, Plus ₹450, University (custom)."""
    __tablename__ = "billing_plans"

    id = Column(String(32), primary_key=True)  # pilot, core, plus, university
    name = Column(String(80), nullable=False)
    price_per_student_year = Column(Numeric(10, 2), nullable=False, default=0)
    max_students = Column(Integer, nullable=True)
    features_json = Column(Text, nullable=False, default="{}")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Subscription(Base):
    """Institution's active subscription to a billing plan."""
    __tablename__ = "subscriptions"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    plan_id = Column(String(32), ForeignKey("billing_plans.id"), nullable=False)
    student_seats = Column(Integer, nullable=False, default=100)
    start_date = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    end_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(24), nullable=False, default="active")  # active, expired, cancelled, trial
    is_simulated = Column(Boolean, nullable=False, default=True)  # SIMULATED label for demo
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


# ============================================================================
# 24. APPEND-ONLY AUDIT EVENTS
# ============================================================================

class AuditEvent(Base):
    """
    Append-only audit trail. Application code MUST NOT UPDATE or DELETE rows.
    Covers all security-relevant actions across the platform.
    """
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)  # auth.login, auth.logout, grade.change, ticket.create, etc.
    actor_id = Column(String(64), nullable=True)      # user who performed action (NULL for system)
    actor_role = Column(String(40), nullable=True)
    target_type = Column(String(64), nullable=True)    # user, course, ticket, etc.
    target_id = Column(String(64), nullable=True)
    action = Column(String(64), nullable=False)
    detail_json = Column(Text, nullable=False, default="{}")
    ip_address = Column(String(45), nullable=True, info={"sensitive": True})  # only for non-sensitive routes
    is_sensitive_route = Column(Boolean, nullable=False, default=False)  # True = no IP stored
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)

    __table_args__ = (
        Index("ix_audit_tenant_type_created", "tenant_id", "event_type", "created_at"),
        Index("ix_audit_target", "target_type", "target_id"),
    )
