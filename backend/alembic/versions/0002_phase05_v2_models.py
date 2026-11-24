"""Phase 05: Add nine v2 required models and comprehensive supporting tables

Revision ID: 0002_phase05_v2_models
Revises: 0001_initial_schema
Create Date: 2026-11-22 15:00:00.000000

SAFETY: This migration is purely ADDITIVE — it creates new tables and adds
new columns to existing tables. It NEVER drops existing tables or columns.
Downgrade removes only the NEW tables/columns added here.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0002_phase05_v2_models'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _is_postgres(bind):
    return bind.dialect.name == 'postgresql'


def _table_exists(bind, table_name):
    from sqlalchemy import inspect as sa_inspect
    inspector = sa_inspect(bind)
    return table_name in inspector.get_table_names()


def _column_exists(bind, table_name, column_name):
    from sqlalchemy import inspect as sa_inspect
    inspector = sa_inspect(bind)
    if table_name not in inspector.get_table_names():
        return False
    columns = [c['name'] for c in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    bind = op.get_bind()
    is_pg = _is_postgres(bind)

    # Enable pgvector extension on PostgreSQL
    if is_pg:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # --- 1. institutions (new) ---
    if not _table_exists(bind, 'institutions'):
        op.create_table(
            'institutions',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('name', sa.String(200), nullable=False),
            sa.Column('code', sa.String(32), unique=True, nullable=False),
            sa.Column('domain', sa.String(200), nullable=True),
            sa.Column('address', sa.Text, nullable=True),
            sa.Column('tier', sa.String(40), nullable=False, server_default='pilot'),
            sa.Column('student_cap', sa.Integer, nullable=False, server_default='500'),
            sa.Column('rsa_public_key', sa.Text, nullable=True),
            sa.Column('icc_rsa_public_key', sa.Text, nullable=True),
            sa.Column('config_json', sa.Text, nullable=False, server_default='{}'),
            sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.CheckConstraint('student_cap > 0', name='ck_institution_student_cap_positive'),
        )

    # --- 2. Add new columns to users (safe additive) ---
    if _table_exists(bind, 'users'):
        if not _column_exists(bind, 'users', 'is_active'):
            op.add_column('users', sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'))
        if not _column_exists(bind, 'users', 'last_login_at'):
            op.add_column('users', sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True))
        if not _column_exists(bind, 'users', 'updated_at'):
            op.add_column('users', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))

    # --- 3. zk_group_members (new, NO user_id) ---
    if not _table_exists(bind, 'zk_group_members'):
        op.create_table(
            'zk_group_members',
            sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('group_id', sa.String(64), nullable=False, index=True),
            sa.Column('identity_commitment', sa.String(128), nullable=False),
            sa.Column('enrolled_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint('group_id', 'identity_commitment', name='uq_zk_group_commitment'),
        )

    # --- 4. grievance_tickets (new) ---
    if not _table_exists(bind, 'grievance_tickets'):
        op.create_table(
            'grievance_tickets',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('is_sensitive', sa.Boolean, nullable=False, server_default='1'),
            sa.Column('proof_scope', sa.String(128), nullable=False, server_default='default'),
            sa.Column('nullifier', sa.String(128), nullable=False),
            sa.Column('target_tag', sa.String(200), nullable=True),
            sa.Column('encrypted_body', sa.Text, nullable=False),
            sa.Column('encrypted_attachment_ref', sa.String(500), nullable=True),
            sa.Column('key_share_dean', sa.Text, nullable=True),
            sa.Column('key_share_icc', sa.Text, nullable=True),
            sa.Column('status', sa.String(32), nullable=False, server_default='submitted'),
            sa.Column('escalation_level', sa.Integer, nullable=False, server_default='0'),
            sa.Column('tracking_code', sa.String(32), unique=True, nullable=False),
            sa.Column('committee_notes_json', sa.Text, nullable=False, server_default='[]'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('ttl_expires_at', sa.DateTime(timezone=True), nullable=True),
            sa.UniqueConstraint('tenant_id', 'proof_scope', 'nullifier', name='uq_grievance_nullifier_scope'),
            sa.CheckConstraint('escalation_level >= 0 AND escalation_level <= 3', name='ck_grievance_escalation_range'),
        )

    # --- 5. cohorts (new) ---
    if not _table_exists(bind, 'cohorts'):
        op.create_table(
            'cohorts',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('course_id', sa.String(64), sa.ForeignKey('courses.id'), nullable=False, index=True),
            sa.Column('name', sa.String(80), nullable=False, server_default='Section A'),
            sa.Column('term', sa.String(32), nullable=False, server_default='2026-odd'),
            sa.Column('year', sa.Integer, nullable=False, server_default='2026'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint('tenant_id', 'course_id', 'name', 'term', name='uq_cohort_identity'),
        )

    # --- Add new columns to course_enrollments (safe additive) ---
    if _table_exists(bind, 'course_enrollments'):
        if not _column_exists(bind, 'course_enrollments', 'cohort_id'):
            op.add_column('course_enrollments', sa.Column('cohort_id', sa.String(64), nullable=True))
        if not _column_exists(bind, 'course_enrollments', 'enrolled_at'):
            op.add_column('course_enrollments', sa.Column('enrolled_at', sa.DateTime(timezone=True), nullable=True))
        if not _column_exists(bind, 'course_enrollments', 'dropped_at'):
            op.add_column('course_enrollments', sa.Column('dropped_at', sa.DateTime(timezone=True), nullable=True))

    # --- 6. assessments (new) ---
    if not _table_exists(bind, 'assessments'):
        op.create_table(
            'assessments',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('course_id', sa.String(64), sa.ForeignKey('courses.id'), nullable=False, index=True),
            sa.Column('title', sa.String(200), nullable=False),
            sa.Column('assessment_type', sa.String(32), nullable=False, server_default='exam'),
            sa.Column('total_marks', sa.Float, nullable=False, server_default='100.0'),
            sa.Column('duration_minutes', sa.Integer, nullable=True),
            sa.Column('is_published', sa.Boolean, nullable=False, server_default='0'),
            sa.Column('created_by', sa.String(64), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.CheckConstraint('total_marks > 0', name='ck_assessment_total_marks_positive'),
        )

    # --- Add new columns to assessment_questions (safe additive) ---
    if _table_exists(bind, 'assessment_questions'):
        if not _column_exists(bind, 'assessment_questions', 'concept_id'):
            op.add_column('assessment_questions', sa.Column('concept_id', sa.String(40), nullable=True))
        if not _column_exists(bind, 'assessment_questions', 'co_id'):
            op.add_column('assessment_questions', sa.Column('co_id', sa.String(16), nullable=True))
        if not _column_exists(bind, 'assessment_questions', 'assessment_id'):
            op.add_column('assessment_questions', sa.Column('assessment_id', sa.String(64), nullable=True))
        if not _column_exists(bind, 'assessment_questions', 'is_active'):
            op.add_column('assessment_questions', sa.Column('is_active', sa.Boolean, nullable=True, server_default='1'))

    # --- 7. question_responses (new) ---
    if not _table_exists(bind, 'question_responses'):
        op.create_table(
            'question_responses',
            sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('question_id', sa.Integer, sa.ForeignKey('assessment_questions.id'), nullable=False, index=True),
            sa.Column('student_id', sa.String(64), sa.ForeignKey('users.id'), nullable=False, index=True),
            sa.Column('selected_option', sa.Integer, nullable=True),
            sa.Column('free_text_answer', sa.Text, nullable=True),
            sa.Column('marks_awarded', sa.Float, nullable=True),
            sa.Column('is_correct', sa.Boolean, nullable=True),
            sa.Column('answered_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint('question_id', 'student_id', name='uq_response_question_student'),
        )

    # --- 8. marks_imports (new) ---
    if not _table_exists(bind, 'marks_imports'):
        op.create_table(
            'marks_imports',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('course_id', sa.String(64), sa.ForeignKey('courses.id'), nullable=False, index=True),
            sa.Column('imported_by', sa.String(64), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('source_type', sa.String(16), nullable=False, server_default='csv'),
            sa.Column('source_file_ref', sa.String(500), nullable=True),
            sa.Column('checksum', sa.String(128), nullable=True),
            sa.Column('row_count', sa.Integer, nullable=False, server_default='0'),
            sa.Column('error_count', sa.Integer, nullable=False, server_default='0'),
            sa.Column('status', sa.String(24), nullable=False, server_default='pending'),
            sa.Column('confirmed_by', sa.String(64), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # --- Add import_id and assessment_id to mark_records (safe additive) ---
    if _table_exists(bind, 'mark_records'):
        if not _column_exists(bind, 'mark_records', 'import_id'):
            op.add_column('mark_records', sa.Column('import_id', sa.String(64), nullable=True))
        if not _column_exists(bind, 'mark_records', 'assessment_id'):
            op.add_column('mark_records', sa.Column('assessment_id', sa.String(64), nullable=True))

    # --- Add new columns to concept_nodes (safe additive) ---
    if _table_exists(bind, 'concept_nodes'):
        if not _column_exists(bind, 'concept_nodes', 'bloom_level'):
            op.add_column('concept_nodes', sa.Column('bloom_level', sa.String(16), nullable=True))
        if not _column_exists(bind, 'concept_nodes', 'weight'):
            op.add_column('concept_nodes', sa.Column('weight', sa.Float, nullable=True, server_default='1.0'))

    # --- 9. concept_edges (new) ---
    if not _table_exists(bind, 'concept_edges'):
        op.create_table(
            'concept_edges',
            sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('course_id', sa.String(64), sa.ForeignKey('courses.id'), nullable=False, index=True),
            sa.Column('from_concept_code', sa.String(40), nullable=False),
            sa.Column('to_concept_code', sa.String(40), nullable=False),
            sa.UniqueConstraint('course_id', 'from_concept_code', 'to_concept_code', name='uq_concept_edge'),
        )

    # --- 10. review_cards (new) ---
    if not _table_exists(bind, 'review_cards'):
        op.create_table(
            'review_cards',
            sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('student_id', sa.String(64), sa.ForeignKey('users.id'), nullable=False, index=True),
            sa.Column('course_id', sa.String(64), sa.ForeignKey('courses.id'), nullable=False, index=True),
            sa.Column('concept_id', sa.String(40), nullable=False),
            sa.Column('question_id', sa.Integer, nullable=True),
            sa.Column('stability', sa.Float, nullable=False, server_default='1.0'),
            sa.Column('difficulty', sa.Float, nullable=False, server_default='0.5'),
            sa.Column('last_review', sa.DateTime(timezone=True), nullable=True),
            sa.Column('next_due', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('reps', sa.Integer, nullable=False, server_default='0'),
            sa.Column('lapses', sa.Integer, nullable=False, server_default='0'),
            sa.Column('state', sa.String(16), nullable=False, server_default='new'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.UniqueConstraint('student_id', 'course_id', 'concept_id', name='uq_review_card_student_concept'),
            sa.CheckConstraint('stability > 0', name='ck_review_card_stability_positive'),
        )

    # --- 11. exam_schedules (new) ---
    if not _table_exists(bind, 'exam_schedules'):
        op.create_table(
            'exam_schedules',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('course_id', sa.String(64), sa.ForeignKey('courses.id'), nullable=False, index=True),
            sa.Column('assessment_id', sa.String(64), nullable=True),
            sa.Column('room_id', sa.String(64), nullable=False),
            sa.Column('invigilator_id', sa.String(64), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('exam_date', sa.DateTime(timezone=True), nullable=False),
            sa.Column('duration_minutes', sa.Integer, nullable=False, server_default='180'),
            sa.Column('rollback_version', sa.Integer, nullable=False, server_default='1'),
            sa.Column('solver_status', sa.String(24), nullable=False, server_default='draft'),
            sa.Column('conflict_json', sa.Text, nullable=False, server_default='[]'),
            sa.Column('approved_by', sa.String(64), nullable=True),
            sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint('rollback_version >= 1', name='ck_exam_rollback_version_min'),
            sa.CheckConstraint('duration_minutes > 0', name='ck_exam_duration_positive'),
        )

    # --- 12. attendance_scans (new) ---
    if not _table_exists(bind, 'attendance_scans'):
        op.create_table(
            'attendance_scans',
            sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('student_id', sa.String(64), sa.ForeignKey('users.id'), nullable=False, index=True),
            sa.Column('course_id', sa.String(64), sa.ForeignKey('courses.id'), nullable=False, index=True),
            sa.Column('session_id', sa.String(64), nullable=False, index=True),
            sa.Column('device_hash', sa.String(128), nullable=False),
            sa.Column('scanned_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('geofence_status', sa.String(24), nullable=False, server_default='unknown'),
            sa.Column('anomaly_score', sa.Float, nullable=False, server_default='0.0'),
            sa.Column('qr_token_hash', sa.String(128), nullable=True),
            sa.Column('is_valid', sa.Boolean, nullable=False, server_default='1'),
            sa.Column('review_status', sa.String(24), nullable=False, server_default='auto_accepted'),
            sa.CheckConstraint('anomaly_score >= 0 AND anomaly_score <= 1', name='ck_scan_anomaly_range'),
        )

    # --- 13. equipment (new) ---
    if not _table_exists(bind, 'equipment'):
        op.create_table(
            'equipment',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('name', sa.String(200), nullable=False),
            sa.Column('asset_tag', sa.String(64), nullable=True),
            sa.Column('category', sa.String(64), nullable=False, server_default='general'),
            sa.Column('location', sa.String(200), nullable=False, server_default='Unknown'),
            sa.Column('manufacturer', sa.String(120), nullable=True),
            sa.Column('model_number', sa.String(120), nullable=True),
            sa.Column('installed_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('maintenance_logs', sa.Text, nullable=False, server_default='[]'),
            sa.Column('weibull_k', sa.Float, nullable=True),
            sa.Column('weibull_lambda', sa.Float, nullable=True),
            sa.Column('last_service_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('status', sa.String(24), nullable=False, server_default='operational'),
            sa.Column('photo_ref', sa.String(500), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint('weibull_k IS NULL OR weibull_k > 0', name='ck_equipment_weibull_k_positive'),
            sa.CheckConstraint('weibull_lambda IS NULL OR weibull_lambda > 0', name='ck_equipment_weibull_lambda_positive'),
        )

    # --- 14. maintenance_events (new) ---
    if not _table_exists(bind, 'maintenance_events'):
        op.create_table(
            'maintenance_events',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('equipment_id', sa.String(64), sa.ForeignKey('equipment.id'), nullable=False, index=True),
            sa.Column('event_type', sa.String(32), nullable=False, server_default='repair'),
            sa.Column('description', sa.Text, nullable=True),
            sa.Column('performed_by', sa.String(64), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('cost', sa.Numeric(10, 2), nullable=True),
            sa.Column('is_failure', sa.Boolean, nullable=False, server_default='0'),
            sa.Column('event_date', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # --- 15. events (new) ---
    if not _table_exists(bind, 'events'):
        vec_type = sa.Text  # default for SQLite
        op.create_table(
            'events',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('title', sa.String(300), nullable=False),
            sa.Column('category', sa.String(64), nullable=False, server_default='general'),
            sa.Column('organizer', sa.String(200), nullable=True),
            sa.Column('description', sa.Text, nullable=True),
            sa.Column('ocr_content', sa.Text, nullable=True),
            sa.Column('ocr_confidence', sa.Float, nullable=True),
            sa.Column('embedding', vec_type, nullable=True),
            sa.Column('faculty_approval_flag', sa.Boolean, nullable=False, server_default='0'),
            sa.Column('approved_by', sa.String(64), nullable=True),
            sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('source_poster_ref', sa.String(500), nullable=True),
            sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('registration_deadline', sa.DateTime(timezone=True), nullable=True),
            sa.Column('location', sa.String(200), nullable=True),
            sa.Column('eligibility', sa.Text, nullable=True),
            sa.Column('external_url', sa.String(500), nullable=True),
            sa.Column('is_published', sa.Boolean, nullable=False, server_default='0'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )

    # --- Add asset_id, dedup_group_id, embedding to maintenance_tickets (safe additive) ---
    if _table_exists(bind, 'maintenance_tickets'):
        if not _column_exists(bind, 'maintenance_tickets', 'asset_id'):
            op.add_column('maintenance_tickets', sa.Column('asset_id', sa.String(64), nullable=True))
        if not _column_exists(bind, 'maintenance_tickets', 'dedup_group_id'):
            op.add_column('maintenance_tickets', sa.Column('dedup_group_id', sa.String(64), nullable=True))
        if not _column_exists(bind, 'maintenance_tickets', 'embedding'):
            op.add_column('maintenance_tickets', sa.Column('embedding', sa.Text, nullable=True))
        if not _column_exists(bind, 'maintenance_tickets', 'updated_at'):
            op.add_column('maintenance_tickets', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))

    # --- 16. dedup_groups (new) ---
    if not _table_exists(bind, 'dedup_groups'):
        op.create_table(
            'dedup_groups',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('canonical_ticket_id', sa.String(64), nullable=True),
            sa.Column('similarity_threshold', sa.Float, nullable=False, server_default='0.82'),
            sa.Column('reporter_count', sa.Integer, nullable=False, server_default='1'),
            sa.Column('merged_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
        )

    # --- 17. study_plans (new) ---
    if not _table_exists(bind, 'study_plans'):
        op.create_table(
            'study_plans',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('student_id', sa.String(64), sa.ForeignKey('users.id'), nullable=False, index=True),
            sa.Column('total_weekly_hours', sa.Float, nullable=False, server_default='20.0'),
            sa.Column('allocation_json', sa.Text, nullable=False, server_default='{}'),
            sa.Column('projected_gpa', sa.Float, nullable=True),
            sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )

    # --- Add plan_id to study_plan_items (safe additive) ---
    if _table_exists(bind, 'study_plan_items'):
        if not _column_exists(bind, 'study_plan_items', 'plan_id'):
            op.add_column('study_plan_items', sa.Column('plan_id', sa.String(64), nullable=True))

    # --- 18. peer_preferences (new) ---
    if not _table_exists(bind, 'peer_preferences'):
        op.create_table(
            'peer_preferences',
            sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('student_id', sa.String(64), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('course_id', sa.String(64), sa.ForeignKey('courses.id'), nullable=False),
            sa.Column('opted_in', sa.Boolean, nullable=False, server_default='1'),
            sa.Column('availability_json', sa.Text, nullable=False, server_default='[]'),
            sa.Column('goals', sa.Text, nullable=True),
            sa.Column('blocked_students_json', sa.Text, nullable=False, server_default='[]'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.UniqueConstraint('student_id', 'course_id', name='uq_peer_pref_student_course'),
        )

    # --- 19. notices (new) ---
    if not _table_exists(bind, 'notices'):
        op.create_table(
            'notices',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('title', sa.String(300), nullable=False),
            sa.Column('body', sa.Text, nullable=True),
            sa.Column('category', sa.String(64), nullable=False, server_default='general'),
            sa.Column('issued_by', sa.String(64), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('is_published', sa.Boolean, nullable=False, server_default='0'),
            sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # --- 20. assets (new) ---
    if not _table_exists(bind, 'assets'):
        op.create_table(
            'assets',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('file_name', sa.String(300), nullable=False),
            sa.Column('content_type', sa.String(100), nullable=True),
            sa.Column('storage_ref', sa.String(500), nullable=False),
            sa.Column('encryption_key_ref', sa.String(200), nullable=True),
            sa.Column('size_bytes', sa.BigInteger, nullable=True),
            sa.Column('checksum_sha256', sa.String(64), nullable=True),
            sa.Column('uploaded_by', sa.String(64), sa.ForeignKey('users.id'), nullable=True),
            sa.Column('access_level', sa.String(24), nullable=False, server_default='private'),
            sa.Column('ttl_expires_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # --- 21. document_chunks (new) ---
    if not _table_exists(bind, 'document_chunks'):
        op.create_table(
            'document_chunks',
            sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('course_id', sa.String(64), nullable=True, index=True),
            sa.Column('asset_id', sa.String(64), nullable=True),
            sa.Column('chunk_index', sa.Integer, nullable=False, server_default='0'),
            sa.Column('content', sa.Text, nullable=False),
            sa.Column('page_number', sa.Integer, nullable=True),
            sa.Column('section_title', sa.String(200), nullable=True),
            sa.Column('embedding', sa.Text, nullable=True),
            sa.Column('version', sa.Integer, nullable=False, server_default='1'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # --- 22. billing_plans (new) ---
    if not _table_exists(bind, 'billing_plans'):
        op.create_table(
            'billing_plans',
            sa.Column('id', sa.String(32), primary_key=True),
            sa.Column('name', sa.String(80), nullable=False),
            sa.Column('price_per_student_year', sa.Numeric(10, 2), nullable=False, server_default='0'),
            sa.Column('max_students', sa.Integer, nullable=True),
            sa.Column('features_json', sa.Text, nullable=False, server_default='{}'),
            sa.Column('is_active', sa.Boolean, nullable=False, server_default='1'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # --- 23. subscriptions (new) ---
    if not _table_exists(bind, 'subscriptions'):
        op.create_table(
            'subscriptions',
            sa.Column('id', sa.String(64), primary_key=True),
            sa.Column('tenant_id', sa.String(64), sa.ForeignKey('colleges.id'), nullable=False, index=True),
            sa.Column('plan_id', sa.String(32), sa.ForeignKey('billing_plans.id'), nullable=False),
            sa.Column('student_seats', sa.Integer, nullable=False, server_default='100'),
            sa.Column('start_date', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('status', sa.String(24), nullable=False, server_default='active'),
            sa.Column('is_simulated', sa.Boolean, nullable=False, server_default='1'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )

    # --- 24. audit_events (new, append-only) ---
    if not _table_exists(bind, 'audit_events'):
        op.create_table(
            'audit_events',
            sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
            sa.Column('tenant_id', sa.String(64), nullable=False, index=True),
            sa.Column('event_type', sa.String(64), nullable=False),
            sa.Column('actor_id', sa.String(64), nullable=True),
            sa.Column('actor_role', sa.String(40), nullable=True),
            sa.Column('target_type', sa.String(64), nullable=True),
            sa.Column('target_id', sa.String(64), nullable=True),
            sa.Column('action', sa.String(64), nullable=False),
            sa.Column('detail_json', sa.Text, nullable=False, server_default='{}'),
            sa.Column('ip_address', sa.String(45), nullable=True),
            sa.Column('is_sensitive_route', sa.Boolean, nullable=False, server_default='0'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
        )

    # --- Add courses.is_active, courses.created_at (safe additive) ---
    if _table_exists(bind, 'courses'):
        if not _column_exists(bind, 'courses', 'is_active'):
            op.add_column('courses', sa.Column('is_active', sa.Boolean, nullable=True, server_default='1'))
        if not _column_exists(bind, 'courses', 'created_at'):
            op.add_column('courses', sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))

    # --- PostgreSQL-specific: create ivfflat index on pgvector columns ---
    if is_pg:
        # These use CREATE INDEX IF NOT EXISTS where available
        try:
            op.execute("""
                CREATE INDEX IF NOT EXISTS ix_doc_chunk_embedding
                ON document_chunks USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 10)
            """)
        except Exception:
            pass  # Index creation may fail if not enough rows; fine for initial migration
        try:
            op.execute("""
                CREATE INDEX IF NOT EXISTS ix_event_embedding
                ON events USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 10)
            """)
        except Exception:
            pass


def downgrade() -> None:
    """Remove only the NEW tables and columns added by this migration.
    NEVER drops pre-existing tables from 0001."""
    bind = op.get_bind()

    # Drop new tables in reverse dependency order
    new_tables = [
        'audit_events', 'subscriptions', 'billing_plans',
        'document_chunks', 'assets', 'notices',
        'peer_preferences', 'study_plans',
        'dedup_groups',
        'maintenance_events', 'equipment',
        'attendance_scans',
        'exam_schedules',
        'review_cards',
        'concept_edges',
        'question_responses',
        'marks_imports',
        'assessments',
        'cohorts',
        'grievance_tickets',
        'zk_group_members',
        'institutions',
        'events',
    ]
    for t in new_tables:
        if _table_exists(bind, t):
            op.drop_table(t)

    # Remove added columns from existing tables (safe)
    for col in ['is_active', 'last_login_at', 'updated_at']:
        if _column_exists(bind, 'users', col):
            try:
                op.drop_column('users', col)
            except Exception:
                pass

    for col in ['cohort_id', 'enrolled_at', 'dropped_at']:
        if _column_exists(bind, 'course_enrollments', col):
            try:
                op.drop_column('course_enrollments', col)
            except Exception:
                pass

    for col in ['concept_id', 'co_id', 'assessment_id', 'is_active']:
        if _column_exists(bind, 'assessment_questions', col):
            try:
                op.drop_column('assessment_questions', col)
            except Exception:
                pass

    for col in ['import_id', 'assessment_id']:
        if _column_exists(bind, 'mark_records', col):
            try:
                op.drop_column('mark_records', col)
            except Exception:
                pass

    for col in ['bloom_level', 'weight']:
        if _column_exists(bind, 'concept_nodes', col):
            try:
                op.drop_column('concept_nodes', col)
            except Exception:
                pass

    for col in ['asset_id', 'dedup_group_id', 'embedding', 'updated_at']:
        if _column_exists(bind, 'maintenance_tickets', col):
            try:
                op.drop_column('maintenance_tickets', col)
            except Exception:
                pass

    if _column_exists(bind, 'study_plan_items', 'plan_id'):
        try:
            op.drop_column('study_plan_items', 'plan_id')
        except Exception:
            pass

    for col in ['is_active', 'created_at']:
        if _column_exists(bind, 'courses', col):
            try:
                op.drop_column('courses', col)
            except Exception:
                pass
