from datetime import datetime, timezone
from typing import Any
import hashlib
import json
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


def utcnow():
    return datetime.now(timezone.utc)


class College(Base):
    __tablename__ = "colleges"

    id = Column(String(64), primary_key=True)
    name = Column(String(200), nullable=False)
    code = Column(String(32), unique=True, nullable=False)
    tier = Column(String(40), nullable=False, default="core")
    student_count = Column(Integer, nullable=False, default=100)
    rsa_n = Column(Text, nullable=True)
    rsa_e = Column(Text, nullable=True)
    rsa_d = Column(Text, nullable=True)
    icc_rsa_n = Column(Text, nullable=True)
    icc_rsa_e = Column(Text, nullable=True)
    icc_rsa_d = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    email = Column(String(200), nullable=False, index=True)
    hashed_password = Column(String(256), nullable=False)
    full_name = Column(String(160), nullable=False)
    role = Column(String(40), nullable=False)  # student, professor, hod, dean, technician, warden, admin, recruiter
    department = Column(String(80), nullable=False, default="CSE")
    semester = Column(Integer, nullable=False, default=5)
    cgpa = Column(Float, nullable=False, default=8.0)
    karma_points = Column(Integer, nullable=False, default=0)
    opt_in_recruiter = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


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


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    semester = Column(Integer, nullable=False, default=5)
    attendance_percentage = Column(Float, nullable=False, default=80.0)
    final_grade = Column(String(8), nullable=True)


class ConceptNode(Base):
    __tablename__ = "concept_nodes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    concept_code = Column(String(40), nullable=False)
    name = Column(String(160), nullable=False)
    prereq_codes_json = Column(Text, nullable=False, default="[]")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    q_code = Column(String(32), nullable=False)
    prompt = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False, default="[]")
    correct_idx = Column(Integer, nullable=False, default=0)
    concept_code = Column(String(40), nullable=False)
    co_code = Column(String(16), nullable=False, default="CO1")
    bloom_level = Column(String(16), nullable=False, default="L2")
    po_codes_json = Column(Text, nullable=False, default='["PO1","PO2"]')
    max_marks = Column(Float, nullable=False, default=10.0)
    irt_b = Column(Float, nullable=False, default=0.0)  # difficulty
    irt_a = Column(Float, nullable=False, default=1.0)  # discrimination


class MarkRecord(Base):
    __tablename__ = "mark_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    question_scores_json = Column(Text, nullable=False, default="{}")
    total_score = Column(Float, nullable=False, default=0.0)
    z_score = Column(Float, nullable=False, default=0.0)
    letter_grade = Column(String(8), nullable=False, default="B")
    encrypted_marks = Column(Text, nullable=True)  # AES-256 encrypted marks for privacy
    created_at = Column(DateTime(timezone=True), default=utcnow)


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


class StudyPlanItem(Base):
    __tablename__ = "study_plan_items"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    concept_code = Column(String(40), nullable=False)
    scheduled_date = Column(String(10), nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False, default=25)
    activity = Column(String(240), nullable=False)
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


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


class TimetableEntry(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False, index=True)
    day_of_week = Column(String(16), nullable=False)  # Monday, Tuesday, ...
    start_time = Column(String(10), nullable=False)   # 09:00
    end_time = Column(String(10), nullable=False)     # 10:00
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


class MaintenanceTicket(Base):
    __tablename__ = "maintenance_tickets"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    reporter_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(160), nullable=False, default="Lab 2 - Bench 14")
    photo_path = Column(String(300), nullable=True)
    vision_category = Column(String(64), nullable=False, default="general")
    vision_confidence = Column(Float, nullable=False, default=0.0)
    embedding_json = Column(Text, nullable=False, default="[]")
    merged_into_id = Column(String(64), nullable=True)
    merged_count = Column(Integer, nullable=False, default=1)
    assigned_to_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    priority = Column(String(24), nullable=False, default="Medium")  # Low, Medium, High, Critical
    priority_weight = Column(Float, nullable=False, default=1.0)
    status = Column(String(32), nullable=False, default="Ticket verified")  # Ticket verified -> Technician dispatched -> Component replaced -> Student sign-off
    sla_category = Column(String(32), nullable=False, default="equipment")  # equipment (48h), hostel (24h)
    sla_deadline = Column(DateTime(timezone=True), nullable=False)
    escalation_level = Column(Integer, nullable=False, default=0)  # 0=none, 1=HoD notified, 2=Dean notified
    resolution_notes = Column(Text, nullable=True)
    resolution_photo = Column(String(300), nullable=True)
    audit_ledger_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime(timezone=True), default=utcnow)


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


class ZKReport(Base):
    __tablename__ = "zk_reports"

    id = Column(String(64), primary_key=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    tracking_code = Column(String(32), unique=True, nullable=False)
    category = Column(String(64), nullable=False)
    encrypted_body = Column(Text, nullable=False)
    key_share_dean = Column(Text, nullable=False)
    key_share_icc = Column(Text, nullable=False)
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


class SquadRequest(Base):
    __tablename__ = "squad_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    student_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    event_id = Column(String(64), nullable=False)
    skills_json = Column(Text, nullable=False, default="[]")
    preferred_role = Column(String(64), nullable=False)  # Frontend, Backend, ML, Design, Pitch
    created_at = Column(DateTime(timezone=True), default=utcnow)


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


class GradeChangeLedger(Base):
    __tablename__ = "grade_change_ledger"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(String(64), ForeignKey("colleges.id"), nullable=False, index=True)
    course_id = Column(String(64), ForeignKey("courses.id"), nullable=False)
    actor_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    action = Column(String(64), nullable=False)  # curve_applied, grace_marks, drop_question, undo
    before_json = Column(Text, nullable=False)
    after_json = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow)
