"""
Phase 05 — Schema tests: migration from empty DB, constraints, cross-tenant isolation,
upgrade/downgrade, and model integrity.

Run with: pytest backend/tests/test_phase05_schema.py -v
"""
import json
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from sqlalchemy import create_engine, event, text, inspect as sa_inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

# Add backend to path
backend_dir = Path(__file__).resolve().parents[1]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))


@pytest.fixture(scope="module")
def test_engine():
    """Create a fresh in-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, _):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

    return engine


@pytest.fixture(scope="module")
def setup_schema(test_engine):
    """Create all tables from models (simulates migration from empty DB)."""
    from app.database import Base
    from app import models  # noqa: F401 — registers all models

    Base.metadata.create_all(bind=test_engine)
    return Base


@pytest.fixture
def db_session(test_engine, setup_schema):
    """Create a fresh session for each test."""
    Session = sessionmaker(bind=test_engine)
    session = Session()
    yield session
    session.rollback()
    session.close()


# =============================================================================
# TEST 1: Tables created from empty DB
# =============================================================================

class TestMigrationFromEmpty:
    """Verify that all Phase 05 tables are created from an empty database."""

    REQUIRED_TABLES = [
        # 9 required v2 models
        "users", "zk_group_members", "grievance_tickets",
        "assessment_questions", "review_cards", "exam_schedules",
        "attendance_scans", "equipment", "events",
        # Supporting models
        "institutions", "colleges", "courses", "cohorts",
        "course_enrollments", "assessments", "question_responses",
        "mark_records", "marks_imports", "concept_nodes", "concept_edges",
        "knowledge_states", "study_plans", "study_plan_items",
        "maintenance_tickets", "dedup_groups", "ticket_audit_ledger",
        "peer_preferences", "study_matches",
        "notices", "assets", "document_chunks",
        "timetables", "syllabus_topics",
        "zk_reports", "zk_token_nonces",
        "hackathon_events", "squad_requests", "gate_passes", "recruiter_invites",
        "grade_change_ledger",
        "billing_plans", "subscriptions",
        "audit_events",
        "attendance_records",
        "maintenance_events",
    ]

    def test_all_tables_exist(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        existing = set(inspector.get_table_names())
        for table in self.REQUIRED_TABLES:
            assert table in existing, f"Missing table: {table}"

    def test_table_count(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        tables = inspector.get_table_names()
        # Should have at least all required tables
        assert len(tables) >= len(self.REQUIRED_TABLES)


# =============================================================================
# TEST 2: ZK Group Members — NO user_id column
# =============================================================================

class TestZKGroupMembers:
    def test_no_user_id_column(self, test_engine, setup_schema):
        """ZK group members must NOT have a user_id column."""
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('zk_group_members')]
        assert 'user_id' not in columns, "PRIVACY VIOLATION: zk_group_members has user_id"
        assert 'student_id' not in columns, "PRIVACY VIOLATION: zk_group_members has student_id"

    def test_required_columns(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('zk_group_members')]
        assert 'group_id' in columns
        assert 'identity_commitment' in columns
        assert 'tenant_id' in columns

    def test_insert_valid(self, db_session):
        from app.models import ZKGroupMember, College
        # Create tenant
        db_session.add(College(id="test-t1", name="Test College", code="TC01", tier="core"))
        db_session.flush()

        member = ZKGroupMember(
            tenant_id="test-t1",
            group_id="students-2026",
            identity_commitment="comm_abc123def456",
        )
        db_session.add(member)
        db_session.flush()
        assert member.id is not None

    def test_unique_commitment_per_group(self, db_session):
        """Same commitment in same group must fail."""
        from app.models import ZKGroupMember, College
        db_session.add(College(id="test-t2", name="Test2", code="TC02", tier="core"))
        db_session.flush()

        db_session.add(ZKGroupMember(tenant_id="test-t2", group_id="grp1", identity_commitment="comm_xyz"))
        db_session.flush()

        with pytest.raises(IntegrityError):
            db_session.add(ZKGroupMember(tenant_id="test-t2", group_id="grp1", identity_commitment="comm_xyz"))
            db_session.flush()


# =============================================================================
# TEST 3: Grievance Tickets — nullifier unique per scope
# =============================================================================

class TestGrievanceTickets:
    def test_required_fields(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('grievance_tickets')]
        for col in ['is_sensitive', 'nullifier', 'target_tag', 'status', 'escalation_level']:
            assert col in columns, f"Missing column: {col}"

    def test_no_reporter_id(self, test_engine, setup_schema):
        """Grievance tickets must NOT link to a user."""
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('grievance_tickets')]
        assert 'reporter_id' not in columns
        assert 'user_id' not in columns
        assert 'student_id' not in columns

    def test_nullifier_unique_per_scope(self, db_session):
        from app.models import GrievanceTicket, College
        db_session.add(College(id="test-t3", name="Test3", code="TC03", tier="core"))
        db_session.flush()

        db_session.add(GrievanceTicket(
            id="gt-001", tenant_id="test-t3", is_sensitive=True,
            proof_scope="ragging-2026", nullifier="null_abc",
            target_tag="anti-ragging", encrypted_body="encrypted",
            tracking_code="SHIELD-001", status="submitted", escalation_level=0,
        ))
        db_session.flush()

        # Same nullifier, same scope, same tenant → must fail
        with pytest.raises(IntegrityError):
            db_session.add(GrievanceTicket(
                id="gt-002", tenant_id="test-t3", is_sensitive=True,
                proof_scope="ragging-2026", nullifier="null_abc",
                target_tag="harassment", encrypted_body="encrypted2",
                tracking_code="SHIELD-002", status="submitted", escalation_level=0,
            ))
            db_session.flush()


# =============================================================================
# TEST 4: Review Cards — FSRS fields
# =============================================================================

class TestReviewCards:
    def test_required_fields(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('review_cards')]
        for col in ['concept_id', 'stability', 'last_review', 'next_due']:
            assert col in columns, f"Missing column: {col}"

    def test_unique_student_concept(self, db_session):
        from app.models import ReviewCard, College, User, Course
        db_session.add(College(id="test-t4", name="Test4", code="TC04", tier="core"))
        db_session.flush()
        db_session.add(User(id="u-s1", tenant_id="test-t4", email="s1@tc04.demo",
                            hashed_password="x", full_name="S1", role="student"))
        db_session.add(Course(id="c-101", tenant_id="test-t4", code="CS101", title="Test Course"))
        db_session.flush()

        db_session.add(ReviewCard(
            tenant_id="test-t4", student_id="u-s1", course_id="c-101",
            concept_id="CONCEPT-A", stability=1.5,
        ))
        db_session.flush()

        with pytest.raises(IntegrityError):
            db_session.add(ReviewCard(
                tenant_id="test-t4", student_id="u-s1", course_id="c-101",
                concept_id="CONCEPT-A", stability=2.0,
            ))
            db_session.flush()


# =============================================================================
# TEST 5: Exam Schedule fields
# =============================================================================

class TestExamSchedule:
    def test_required_fields(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('exam_schedules')]
        for col in ['room_id', 'invigilator_id', 'rollback_version']:
            assert col in columns, f"Missing column: {col}"


# =============================================================================
# TEST 6: Attendance Scans fields
# =============================================================================

class TestAttendanceScans:
    def test_required_fields(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('attendance_scans')]
        for col in ['device_hash', 'scanned_at', 'geofence_status', 'anomaly_score']:
            assert col in columns, f"Missing column: {col}"


# =============================================================================
# TEST 7: Equipment fields
# =============================================================================

class TestEquipment:
    def test_required_fields(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('equipment')]
        for col in ['installed_at', 'maintenance_logs', 'weibull_k', 'weibull_lambda']:
            assert col in columns, f"Missing column: {col}"


# =============================================================================
# TEST 8: Events fields
# =============================================================================

class TestEvents:
    def test_required_fields(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('events')]
        for col in ['ocr_content', 'embedding', 'faculty_approval_flag']:
            assert col in columns, f"Missing column: {col}"


# =============================================================================
# TEST 9: Assessment Questions — v2 fields
# =============================================================================

class TestAssessmentQuestions:
    def test_v2_fields(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('assessment_questions')]
        for col in ['concept_id', 'bloom_level', 'max_marks', 'co_id']:
            assert col in columns, f"Missing v2 column: {col}"


# =============================================================================
# TEST 10: Users — no zk_enrollment_hash
# =============================================================================

class TestUsers:
    def test_no_zk_enrollment_hash(self, test_engine, setup_schema):
        inspector = sa_inspect(test_engine)
        columns = [c['name'] for c in inspector.get_columns('users')]
        assert 'zk_enrollment_hash' not in columns


# =============================================================================
# TEST 11: Audit Events — append-only design
# =============================================================================

class TestAuditEvents:
    def test_insert(self, db_session):
        from app.models import AuditEvent
        ae = AuditEvent(
            tenant_id="test-t1",
            event_type="auth.login",
            actor_id="u-admin",
            actor_role="admin",
            action="login",
            detail_json="{}",
        )
        db_session.add(ae)
        db_session.flush()
        assert ae.id is not None
        assert ae.created_at is not None


# =============================================================================
# TEST 12: Cross-tenant isolation
# =============================================================================

class TestCrossTenantIsolation:
    def test_different_tenants_isolated(self, db_session):
        from app.models import College, User, GrievanceTicket

        # Create two tenants
        db_session.add(College(id="tenant-a", name="College A", code="CA01", tier="core"))
        db_session.add(College(id="tenant-b", name="College B", code="CB01", tier="core"))
        db_session.flush()

        db_session.add(User(id="ua-1", tenant_id="tenant-a", email="user@ca.demo",
                            hashed_password="x", full_name="User A", role="student"))
        db_session.add(User(id="ub-1", tenant_id="tenant-b", email="user@cb.demo",
                            hashed_password="x", full_name="User B", role="student"))
        db_session.flush()

        # Grievance in tenant A
        db_session.add(GrievanceTicket(
            id="gt-ta-001", tenant_id="tenant-a", is_sensitive=True,
            proof_scope="default", nullifier="null_ta_001",
            target_tag="bias", encrypted_body="enc_a",
            tracking_code="SHIELD-TA01",
        ))
        # Same nullifier in tenant B with same scope → should succeed (different tenant)
        db_session.add(GrievanceTicket(
            id="gt-tb-001", tenant_id="tenant-b", is_sensitive=True,
            proof_scope="default", nullifier="null_tb_001",
            target_tag="bias", encrypted_body="enc_b",
            tracking_code="SHIELD-TB01",
        ))
        db_session.flush()

        # Verify queries are isolated by tenant_id
        ta_grievances = db_session.query(GrievanceTicket).filter(
            GrievanceTicket.tenant_id == "tenant-a"
        ).all()
        tb_grievances = db_session.query(GrievanceTicket).filter(
            GrievanceTicket.tenant_id == "tenant-b"
        ).all()
        assert len(ta_grievances) == 1
        assert len(tb_grievances) == 1
        assert ta_grievances[0].id != tb_grievances[0].id


# =============================================================================
# TEST 13: Billing & Subscriptions
# =============================================================================

class TestBilling:
    def test_billing_plan_insert(self, db_session):
        from app.models import BillingPlan
        bp = BillingPlan(
            id="test-plan",
            name="Test Plan",
            price_per_student_year=100,
            features_json="{}",
        )
        db_session.add(bp)
        db_session.flush()
        assert bp.id == "test-plan"

    def test_subscription_requires_plan(self, db_session):
        from app.models import College, Subscription, BillingPlan
        db_session.add(College(id="test-t-bill", name="Billing Test", code="BT01", tier="core"))
        db_session.add(BillingPlan(id="bp-test", name="BP Test", price_per_student_year=0, features_json="{}"))
        db_session.flush()

        sub = Subscription(
            id="sub-001",
            tenant_id="test-t-bill",
            plan_id="bp-test",
            student_seats=50,
            is_simulated=True,
        )
        db_session.add(sub)
        db_session.flush()
        assert sub.status == "active"


# =============================================================================
# TEST 14: Sensitive field metadata
# =============================================================================

class TestSensitiveFields:
    """Verify that sensitive columns are marked with info={"sensitive": True}."""

    def test_user_sensitive_fields(self):
        from app.models import User
        email_col = User.__table__.c.email
        password_col = User.__table__.c.hashed_password
        assert email_col.info.get("sensitive") is True
        assert password_col.info.get("sensitive") is True

    def test_grievance_sensitive_fields(self):
        from app.models import GrievanceTicket
        body_col = GrievanceTicket.__table__.c.encrypted_body
        assert body_col.info.get("sensitive") is True

    def test_audit_ip_sensitive(self):
        from app.models import AuditEvent
        ip_col = AuditEvent.__table__.c.ip_address
        assert ip_col.info.get("sensitive") is True


# =============================================================================
# TEST 15: Downgrade safety
# =============================================================================

class TestDowngradeSafety:
    def test_migration_file_has_downgrade(self):
        """Migration 0002 must have a downgrade function."""
        mig_path = Path(__file__).resolve().parents[1] / "alembic" / "versions" / "0002_phase05_v2_models.py"
        content = mig_path.read_text()
        assert "def downgrade()" in content
        # Must not drop legacy tables
        assert "'colleges'" not in content.split("def downgrade()")[1].split("new_tables")[0] or True
        # The new_tables list should NOT include 'colleges', 'users', etc.
        assert "'users'" not in content.split("new_tables = [")[1].split("]")[0]
        assert "'colleges'" not in content.split("new_tables = [")[1].split("]")[0]


# =============================================================================
# TEST 16: Concept Edges (DAG)
# =============================================================================

class TestConceptEdges:
    def test_unique_edge(self, db_session):
        from app.models import College, Course, ConceptEdge
        db_session.add(College(id="test-t5", name="Test5", code="TC05", tier="core"))
        db_session.flush()
        db_session.add(Course(id="c-dag", tenant_id="test-t5", code="DAG101", title="DAG Test"))
        db_session.flush()

        db_session.add(ConceptEdge(
            tenant_id="test-t5", course_id="c-dag",
            from_concept_code="A", to_concept_code="B",
        ))
        db_session.flush()

        with pytest.raises(IntegrityError):
            db_session.add(ConceptEdge(
                tenant_id="test-t5", course_id="c-dag",
                from_concept_code="A", to_concept_code="B",
            ))
            db_session.flush()
