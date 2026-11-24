"""
Phase 05 — Seed synthetic, clearly tagged college data for all v2 models.
All data is tagged as DEMO / synthetic and uses fictitious records.
"""
import json
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

try:
    from .database import SessionLocal, Base, engine
    from .models import (
        Assessment, Asset, AttendanceScan, AuditEvent, BillingPlan,
        Cohort, ConceptEdge, DedupGroup, DocumentChunk, Equipment,
        Event, ExamSchedule, GrievanceTicket, MaintenanceEvent,
        MarksImport, Notice, PeerPreference, QuestionResponse,
        ReviewCard, StudyPlan, Subscription, ZKGroupMember,
    )
except ImportError:
    from app.database import SessionLocal, Base, engine
    from app.models import (
        Assessment, Asset, AttendanceScan, AuditEvent, BillingPlan,
        Cohort, ConceptEdge, DedupGroup, DocumentChunk, Equipment,
        Event, ExamSchedule, GrievanceTicket, MaintenanceEvent,
        MarksImport, Notice, PeerPreference, QuestionResponse,
        ReviewCard, StudyPlan, Subscription, ZKGroupMember,
    )


TENANT_ID = "northstar"


def seed_v2_models(db: Session | None = None):
    """Seed Phase 05 v2 tables with synthetic DEMO data."""
    own_session = db is None
    db = db or SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # --- 1. Billing Plans (from spec) ---
        plans = [
            ("pilot", "Pilot (1-Semester Free)", 0, 500,
             {"M01": True, "M05": True, "M06": True, "M08": True}),
            ("core", "Core", 250, 3000,
             {"M01": True, "M05": True, "M06": True, "M07": True, "M08": True,
              "M12": True, "M15": True}),
            ("plus", "Plus", 450, 10000,
             {"M01": True, "M02": True, "M03": True, "M04": True, "M05": True,
              "M06": True, "M07": True, "M08": True, "M09": True, "M10": True,
              "M11": True, "M12": True, "M13": True, "M14": True, "M15": True}),
            ("university", "University (Custom)", 0, None,
             {"all": True, "sso": True, "vpc": True, "data_region": True}),
        ]
        for plan_id, name, price, max_s, features in plans:
            if not db.query(BillingPlan).filter(BillingPlan.id == plan_id).first():
                db.add(BillingPlan(
                    id=plan_id, name=name,
                    price_per_student_year=price,
                    max_students=max_s,
                    features_json=json.dumps(features),
                ))
        db.flush()

        # --- 2. Subscription (SIMULATED) ---
        sub_id = f"{TENANT_ID}-sub-001"
        if not db.query(Subscription).filter(Subscription.id == sub_id).first():
            db.add(Subscription(
                id=sub_id,
                tenant_id=TENANT_ID,
                plan_id="plus",
                student_seats=200,
                start_date=now - timedelta(days=30),
                end_date=now + timedelta(days=335),
                status="active",
                is_simulated=True,
            ))
        db.flush()

        # --- 3. Cohorts ---
        course_id = f"{TENANT_ID}-cs301"
        cohort_id = f"{TENANT_ID}-cs301-sec-a"
        if not db.query(Cohort).filter(Cohort.id == cohort_id).first():
            db.add(Cohort(
                id=cohort_id,
                tenant_id=TENANT_ID,
                course_id=course_id,
                name="Section A",
                term="2026-odd",
                year=2026,
            ))
        db.flush()

        # --- 4. Assessment ---
        assess_id = f"{TENANT_ID}-cs301-midsem"
        if not db.query(Assessment).filter(Assessment.id == assess_id).first():
            db.add(Assessment(
                id=assess_id,
                tenant_id=TENANT_ID,
                course_id=course_id,
                title="[DEMO] CS301 Mid-Semester Examination",
                assessment_type="exam",
                total_marks=70.0,
                duration_minutes=180,
                is_published=True,
                created_by="usr-professor",
            ))
        db.flush()

        # --- 5. Concept Edges (DAG) ---
        edges = [
            ("OS-ARCH", "OS-PROC"),
            ("OS-PROC", "OS-SCHED"),
            ("OS-PROC", "OS-SYNC"),
            ("OS-SYNC", "OS-DEADLOCK"),
            ("OS-ARCH", "OS-MEM"),
            ("OS-MEM", "OS-VMEM"),
        ]
        for from_c, to_c in edges:
            exists = db.query(ConceptEdge).filter(
                ConceptEdge.course_id == course_id,
                ConceptEdge.from_concept_code == from_c,
                ConceptEdge.to_concept_code == to_c,
            ).first()
            if not exists:
                db.add(ConceptEdge(
                    tenant_id=TENANT_ID,
                    course_id=course_id,
                    from_concept_code=from_c,
                    to_concept_code=to_c,
                ))
        db.flush()

        # --- 6. Review Cards (FSRS) for student-001 ---
        student_id = "usr-student-001"
        concepts = ["OS-ARCH", "OS-PROC", "OS-SCHED", "OS-SYNC", "OS-DEADLOCK", "OS-MEM", "OS-VMEM"]
        for i, concept in enumerate(concepts):
            exists = db.query(ReviewCard).filter(
                ReviewCard.student_id == student_id,
                ReviewCard.course_id == course_id,
                ReviewCard.concept_id == concept,
            ).first()
            if not exists:
                stability = 2.0 + i * 0.5
                db.add(ReviewCard(
                    tenant_id=TENANT_ID,
                    student_id=student_id,
                    course_id=course_id,
                    concept_id=concept,
                    stability=stability,
                    difficulty=0.3 + i * 0.08,
                    last_review=now - timedelta(days=i + 1),
                    next_due=now + timedelta(hours=int(stability * 24)),
                    reps=3 + i,
                    lapses=max(0, i - 3),
                    state="review" if i < 4 else "relearning",
                ))
        db.flush()

        # --- 7. Exam Schedule ---
        exam_id = f"{TENANT_ID}-exam-cs301-midsem"
        if not db.query(ExamSchedule).filter(ExamSchedule.id == exam_id).first():
            db.add(ExamSchedule(
                id=exam_id,
                tenant_id=TENANT_ID,
                course_id=course_id,
                assessment_id=assess_id,
                room_id="HALL-A-101",
                invigilator_id="usr-professor",
                exam_date=now + timedelta(days=14),
                duration_minutes=180,
                rollback_version=1,
                solver_status="optimal",
                conflict_json="[]",
            ))
        db.flush()

        # --- 8. Attendance Scans ---
        for i in range(1, 6):
            sid = f"usr-student-{i:03d}"
            scan_exists = db.query(AttendanceScan).filter(
                AttendanceScan.student_id == sid,
                AttendanceScan.session_id == "session-cs301-20261120",
            ).first()
            if not scan_exists:
                db.add(AttendanceScan(
                    tenant_id=TENANT_ID,
                    student_id=sid,
                    course_id=course_id,
                    session_id="session-cs301-20261120",
                    device_hash=f"sha256:{uuid.uuid4().hex[:32]}",
                    scanned_at=now - timedelta(hours=2, minutes=i * 3),
                    geofence_status="inside" if i != 3 else "outside",
                    anomaly_score=0.05 * i if i != 3 else 0.72,
                    qr_token_hash=f"qr:{uuid.uuid4().hex[:16]}",
                    is_valid=i != 3,
                    review_status="auto_accepted" if i != 3 else "flagged",
                ))
        db.flush()

        # --- 9. Equipment with Weibull parameters ---
        equip_data = [
            ("eq-osc-001", "Tektronix TDS1012C Oscilloscope", "Lab 2 - Bench 14",
             "oscilloscope", "Tektronix", "TDS1012C", 2.1, 730, now - timedelta(days=500)),
            ("eq-proj-001", "BenQ MH733 Projector", "Lecture Hall 101",
             "projector", "BenQ", "MH733", 1.8, 1095, now - timedelta(days=300)),
            ("eq-ac-001", "Daikin FTKL50UV16 AC Unit", "Hostel A Block 2",
             "hvac", "Daikin", "FTKL50UV16", 2.5, 1460, now - timedelta(days=800)),
        ]
        for eid, ename, loc, cat, mfr, model, wk, wl, inst in equip_data:
            if not db.query(Equipment).filter(Equipment.id == eid).first():
                db.add(Equipment(
                    id=eid,
                    tenant_id=TENANT_ID,
                    name=f"[DEMO] {ename}",
                    asset_tag=f"NITX-{eid.upper()}",
                    category=cat,
                    location=loc,
                    manufacturer=mfr,
                    model_number=model,
                    installed_at=inst,
                    maintenance_logs=json.dumps([
                        {"date": (inst + timedelta(days=180)).isoformat(), "type": "inspection", "notes": "Routine check"},
                    ]),
                    weibull_k=wk,
                    weibull_lambda=wl,
                    last_service_at=now - timedelta(days=60),
                    status="operational",
                ))
        db.flush()

        # --- 10. Maintenance Events ---
        for eid in ["eq-osc-001", "eq-proj-001"]:
            me_id = f"{eid}-maint-001"
            if not db.query(MaintenanceEvent).filter(MaintenanceEvent.id == me_id).first():
                db.add(MaintenanceEvent(
                    id=me_id,
                    tenant_id=TENANT_ID,
                    equipment_id=eid,
                    event_type="inspection",
                    description="[DEMO] Routine quarterly inspection",
                    performed_by="usr-technician",
                    cost=0,
                    is_failure=False,
                    event_date=now - timedelta(days=90),
                ))
        db.flush()

        # --- 11. Events (OCR, embeddings, faculty_approval) ---
        event_id = f"{TENANT_ID}-event-hackathon-2026"
        if not db.query(Event).filter(Event.id == event_id).first():
            db.add(Event(
                id=event_id,
                tenant_id=TENANT_ID,
                title="[DEMO] Prasunex Innovathon 2026",
                category="hackathon",
                organizer="Prasunex Campus Ecosystem",
                description="A 48-hour campus hackathon building cognitive operating systems.",
                ocr_content="PRASUNEX INNOVATHON 2026\nDate: November 20-22\nVenue: AI Lab Block B\nRegistration deadline: Nov 15",
                ocr_confidence=0.91,
                faculty_approval_flag=True,
                approved_by="usr-professor",
                approved_at=now - timedelta(days=10),
                start_date=now - timedelta(days=2),
                end_date=now,
                registration_deadline=now - timedelta(days=7),
                location="AI Lab Block B",
                is_published=True,
            ))
        db.flush()

        # --- 12. ZK Group Members (NO user_id!) ---
        zk_members = [
            ("nitx-students-2026", f"comm_{uuid.uuid4().hex[:32]}"),
            ("nitx-students-2026", f"comm_{uuid.uuid4().hex[:32]}"),
            ("nitx-students-2026", f"comm_{uuid.uuid4().hex[:32]}"),
            ("nitx-faculty-2026", f"comm_{uuid.uuid4().hex[:32]}"),
        ]
        for gid, ic in zk_members:
            exists = db.query(ZKGroupMember).filter(
                ZKGroupMember.group_id == gid,
                ZKGroupMember.identity_commitment == ic,
            ).first()
            if not exists:
                db.add(ZKGroupMember(
                    tenant_id=TENANT_ID,
                    group_id=gid,
                    identity_commitment=ic,
                ))
        db.flush()

        # --- 13. Grievance Ticket (nullifier, NO user link) ---
        gt_id = f"{TENANT_ID}-grievance-001"
        if not db.query(GrievanceTicket).filter(GrievanceTicket.id == gt_id).first():
            db.add(GrievanceTicket(
                id=gt_id,
                tenant_id=TENANT_ID,
                is_sensitive=True,
                proof_scope="default",
                nullifier=f"null_{uuid.uuid4().hex[:32]}",
                target_tag="anti-ragging",
                encrypted_body="[DEMO] AES-256 encrypted grievance content placeholder",
                tracking_code="SHIELD-DEMO1",
                status="submitted",
                escalation_level=0,
            ))
        db.flush()

        # --- 14. Notices ---
        notice_id = f"{TENANT_ID}-notice-001"
        if not db.query(Notice).filter(Notice.id == notice_id).first():
            db.add(Notice(
                id=notice_id,
                tenant_id=TENANT_ID,
                title="[DEMO] Mid-Semester Examination Schedule Published",
                body="All students are advised to check the exam portal for updated schedules.",
                category="academic",
                issued_by="usr-admin",
                is_published=True,
                published_at=now,
            ))
        db.flush()

        # --- 15. Document Chunks (RAG) ---
        if not db.query(DocumentChunk).filter(DocumentChunk.tenant_id == TENANT_ID).first():
            db.add(DocumentChunk(
                tenant_id=TENANT_ID,
                course_id=course_id,
                chunk_index=0,
                content="[DEMO] Chapter 1: Introduction to Operating Systems. An operating system acts as an intermediary between a user and computer hardware...",
                page_number=1,
                section_title="Introduction",
                version=1,
            ))
            db.add(DocumentChunk(
                tenant_id=TENANT_ID,
                course_id=course_id,
                chunk_index=1,
                content="[DEMO] Chapter 2: Process Management. A process is a program in execution. It includes the program counter, stack, and data section...",
                page_number=5,
                section_title="Process Management",
                version=1,
            ))
        db.flush()

        # --- 16. Peer Preferences ---
        for i in range(1, 6):
            sid = f"usr-student-{i:03d}"
            exists = db.query(PeerPreference).filter(
                PeerPreference.student_id == sid,
                PeerPreference.course_id == course_id,
            ).first()
            if not exists:
                db.add(PeerPreference(
                    tenant_id=TENANT_ID,
                    student_id=sid,
                    course_id=course_id,
                    opted_in=True,
                    availability_json=json.dumps(["Mon 16:00-18:00", "Wed 14:00-16:00"]),
                    goals=f"[DEMO] Improve understanding of {'deadlocks' if i % 2 == 0 else 'scheduling'}",
                ))
        db.flush()

        # --- 17. Study Plans ---
        sp_id = f"{TENANT_ID}-plan-student001"
        if not db.query(StudyPlan).filter(StudyPlan.id == sp_id).first():
            db.add(StudyPlan(
                id=sp_id,
                tenant_id=TENANT_ID,
                student_id=student_id,
                total_weekly_hours=20.0,
                allocation_json=json.dumps({course_id: 8.0, f"{TENANT_ID}-cs201": 6.0, f"{TENANT_ID}-cs401": 6.0}),
                projected_gpa=8.2,
                is_active=True,
            ))
        db.flush()

        # --- 18. Dedup Groups ---
        dg_id = f"{TENANT_ID}-dedup-001"
        if not db.query(DedupGroup).filter(DedupGroup.id == dg_id).first():
            db.add(DedupGroup(
                id=dg_id,
                tenant_id=TENANT_ID,
                canonical_ticket_id=f"{TENANT_ID}-ticket-101",
                similarity_threshold=0.82,
                reporter_count=2,
            ))
        db.flush()

        # --- 19. Audit Events (append-only) ---
        if not db.query(AuditEvent).filter(AuditEvent.tenant_id == TENANT_ID).first():
            audit_entries = [
                ("auth.login", "usr-admin", "admin", "user", "usr-admin", "login",
                 {"method": "password", "demo": True}, False),
                ("schema.migration", None, None, "database", "0002_phase05", "migrate",
                 {"version": "0002_phase05_v2_models", "demo": True}, False),
                ("seed.synthetic", None, None, "database", "phase05", "seed",
                 {"tables_seeded": 18, "tag": "DEMO_SYNTHETIC", "demo": True}, False),
            ]
            for et, actor, role, tt, tid, action, detail, sensitive in audit_entries:
                db.add(AuditEvent(
                    tenant_id=TENANT_ID,
                    event_type=et,
                    actor_id=actor,
                    actor_role=role,
                    target_type=tt,
                    target_id=tid,
                    action=action,
                    detail_json=json.dumps(detail),
                    is_sensitive_route=sensitive,
                ))
        db.flush()

        db.commit()
        print("[Phase 05] ✓ v2 synthetic seed complete:")
        print("  - Billing plans (Pilot/Core/Plus/University)")
        print("  - Subscription (SIMULATED)")
        print("  - Cohorts, Assessments, Concept Edges (DAG)")
        print("  - Review Cards (FSRS), Exam Schedule")
        print("  - Attendance Scans (with anomaly flags)")
        print("  - Equipment (Weibull parameters), Maintenance Events")
        print("  - Events (OCR + faculty approval)")
        print("  - ZK Group Members (NO user_id)")
        print("  - Grievance Tickets (nullifier, NO user link)")
        print("  - Notices, Document Chunks (RAG), Peer Preferences")
        print("  - Study Plans, Dedup Groups")
        print("  - Audit Events (append-only)")
        print("  All data tagged as [DEMO] / DEMO_SYNTHETIC")

    except Exception as exc:
        db.rollback()
        print(f"[Phase 05] Error seeding v2 models: {exc}")
        raise
    finally:
        if own_session:
            db.close()


if __name__ == "__main__":
    seed_v2_models()
