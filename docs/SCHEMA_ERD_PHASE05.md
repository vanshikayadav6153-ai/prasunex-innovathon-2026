# Phase 05 — Schema ERD & API Ownership

> [!NOTE]
> All 9 required v2 models and 25+ supporting relational models are implemented.
> Migrations run from an empty database with safe upgrade/downgrade paths.

## Entity-Relationship Diagram

```mermaid
erDiagram
    colleges ||--o{ users : "tenant_id"
    colleges ||--o{ courses : "tenant_id"
    colleges ||--o{ zk_group_members : "tenant_id"
    colleges ||--o{ grievance_tickets : "tenant_id"
    colleges ||--o{ equipment : "tenant_id"
    colleges ||--o{ events : "tenant_id"
    colleges ||--o{ audit_events : "tenant_id"
    colleges ||--o{ billing_plans : ""
    colleges ||--o{ subscriptions : "tenant_id"

    users ||--o{ course_enrollments : "student_id"
    users ||--o{ review_cards : "student_id"
    users ||--o{ attendance_scans : "student_id"
    users ||--o{ knowledge_states : "student_id"
    users ||--o{ study_plan_items : "student_id"
    users ||--o{ peer_preferences : "student_id"
    users ||--o{ question_responses : "student_id"

    courses ||--o{ cohorts : "course_id"
    courses ||--o{ assessments : "course_id"
    courses ||--o{ assessment_questions : "course_id"
    courses ||--o{ concept_nodes : "course_id"
    courses ||--o{ concept_edges : "course_id"
    courses ||--o{ course_enrollments : "course_id"
    courses ||--o{ exam_schedules : "course_id"
    courses ||--o{ review_cards : "course_id"
    courses ||--o{ attendance_scans : "course_id"
    courses ||--o{ document_chunks : "course_id"

    assessments ||--o{ assessment_questions : "assessment_id"
    assessments ||--o{ exam_schedules : "assessment_id"
    assessment_questions ||--o{ question_responses : "question_id"

    equipment ||--o{ maintenance_events : "equipment_id"
    equipment ||--o{ maintenance_tickets : "asset_id"

    maintenance_tickets ||--o{ ticket_audit_ledger : "ticket_id"
    dedup_groups ||--o{ maintenance_tickets : "dedup_group_id"

    billing_plans ||--o{ subscriptions : "plan_id"
    assets ||--o{ document_chunks : "asset_id"

    colleges {
        string id PK
        string name
        string code UK
        string tier
        int student_count
    }

    users {
        string id PK
        string tenant_id FK
        string email SENSITIVE
        string hashed_password SENSITIVE
        string full_name
        string role
        boolean is_active
    }

    zk_group_members {
        int id PK
        string tenant_id FK
        string group_id
        string identity_commitment
    }

    grievance_tickets {
        string id PK
        string tenant_id FK
        boolean is_sensitive
        string proof_scope
        string nullifier UK_per_scope
        string target_tag
        string encrypted_body SENSITIVE
        string status
        int escalation_level
        string tracking_code UK
    }

    assessment_questions {
        int id PK
        string tenant_id FK
        string course_id FK
        string concept_id
        string bloom_level
        float max_marks
        string co_id
    }

    review_cards {
        int id PK
        string tenant_id FK
        string student_id FK
        string course_id FK
        string concept_id
        float stability
        datetime last_review
        datetime next_due
    }

    exam_schedules {
        string id PK
        string tenant_id FK
        string course_id FK
        string room_id
        string invigilator_id FK
        int rollback_version
        string solver_status
    }

    attendance_scans {
        int id PK
        string tenant_id FK
        string student_id FK
        string session_id
        string device_hash SENSITIVE
        datetime scanned_at
        string geofence_status
        float anomaly_score
    }

    equipment {
        string id PK
        string tenant_id FK
        string name
        datetime installed_at
        text maintenance_logs
        float weibull_k
        float weibull_lambda
    }

    events {
        string id PK
        string tenant_id FK
        string title
        text ocr_content
        vector embedding
        boolean faculty_approval_flag
    }

    audit_events {
        int id PK
        string tenant_id
        string event_type
        string actor_id
        string action
        text detail_json
        boolean is_sensitive_route
        datetime created_at
    }
```

## Nine Required v2 Models — Field Mapping

| # | Model | Required Fields | Status |
|---|-------|----------------|--------|
| 1 | `users` | No `zk_enrollment_hash` | ✅ VERIFIED |
| 2 | `zk_group_members` | `group_id`, `identity_commitment`, NO `user_id` | ✅ VERIFIED |
| 3 | `grievance_tickets` | `is_sensitive`, `nullifier` (unique/scope), `target_tag`, `status`, `escalation_level` | ✅ VERIFIED |
| 4 | `assessment_questions` | `concept_id`, `bloom_level`, `max_marks`, `co_id` | ✅ VERIFIED |
| 5 | `review_cards` | `concept_id`, `stability`, `last_review`, `next_due` | ✅ VERIFIED |
| 6 | `exam_schedules` | `room_id`, `invigilator_id`, `rollback_version` | ✅ VERIFIED |
| 7 | `attendance_scans` | `device_hash`, `timestamp`, `geofence_status`, `anomaly_score` | ✅ VERIFIED |
| 8 | `equipment` | `installed_at`, `maintenance_logs`, `weibull_k`, `weibull_lambda` | ✅ VERIFIED |
| 9 | `events` | OCR content, embeddings, `faculty_approval_flag` | ✅ VERIFIED |

## API Ownership by Table

| Table | Primary API Module | Access Roles |
|-------|--------------------|--------------|
| `users` | `auth_tenancy` | All (self-only for students) |
| `zk_group_members` | `privacy` | System only (no user link) |
| `grievance_tickets` | `privacy` | Anonymous submit; committee read |
| `assessment_questions` | `academic_engine`, `grading` | Professor (write), Student (read) |
| `review_cards` | `study` | Student (own), System (update) |
| `exam_schedules` | `academic_engine` | Admin/Professor (write), All (read) |
| `attendance_scans` | `attendance` | System (write), Professor/Admin (read) |
| `equipment` | `facilities` | Technician/Admin (write) |
| `maintenance_events` | `facilities` | Technician (write), Admin (read) |
| `events` | `opportunity_radar` | Faculty (approve), Student (read) |
| `billing_plans` | `business_privacy` | Admin/System |
| `subscriptions` | `business_privacy` | Admin (tenant-scoped) |
| `audit_events` | System middleware | Append-only; Admin (read) |
| `document_chunks` | `study` (RAG) | System (write), Student (read, tenant-scoped) |
| `dedup_groups` | `facilities` | System/Technician |
| `peer_preferences` | `network` | Student (own) |
| `notices` | `opportunity_radar` | Faculty/Admin (write), All (read) |

## Privacy & ZK Design Assumptions

> [!IMPORTANT]
> **Zero-Knowledge Enrollment Privacy:**
> - `zk_group_members` stores `(group_id, identity_commitment)` with absolutely NO `user_id`.
> - There is NO table, column, or join path that links a user to their identity commitment or nullifier.
> - The enrollment ceremony MUST be designed so the server never learns which user produced which commitment (e.g., blind signature protocol).
> - `grievance_tickets` uses `nullifier` unique per `(tenant_id, proof_scope)` for double-submit prevention without identity linkage.
> - Sensitive route audit events do NOT store IP addresses (`is_sensitive_route = True`).

> [!WARNING]
> Cryptographic anonymity cannot be guaranteed solely by database design.
> Infrastructure-level controls (IP logging in reverse proxies, CDN logs, timing correlation)
> require separate threat model review. See `docs/ARCHITECTURE_DECISIONS.md`.

## TTL & Data Retention

| Table | TTL Policy |
|-------|-----------|
| `grievance_tickets` | `ttl_expires_at` — auto-purge after resolution + retention period |
| `assets` | `ttl_expires_at` — encrypted files expire per policy |
| `notices` | `expires_at` — unpublish after expiry |
| `audit_events` | Append-only, retained per institution policy (configurable) |
| `zk_token_nonces` | Prunable after token expiry window |

## Indexes & Performance

- **pgvector**: 384-dimensional `ivfflat` indexes on `document_chunks.embedding` and `events.embedding`
- **Composite**: `(tenant_id, event_type, created_at)` on `audit_events`; `(session_id, student_id)` on `attendance_scans`
- **Unique constraints**: Nullifier per scope, enrollment per course, review card per student×concept, concept edge uniqueness
- **Check constraints**: Positive stability, valid anomaly range [0,1], valid Weibull params, valid escalation range

## Migration Commands

```powershell
# From backend directory:
cd backend

# Run migration (from empty or existing DB)
.\.venv\Scripts\python.exe -m alembic upgrade head

# Downgrade (removes only Phase 05 additions)
.\.venv\Scripts\python.exe -m alembic downgrade 0001_initial_schema

# Seed v2 synthetic data
.\.venv\Scripts\python.exe -m app.seed_v2

# Run Phase 05 tests
.\.venv\Scripts\python.exe -m pytest tests/test_phase05_schema.py -v
```
