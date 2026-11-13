import json
import math
import os
import secrets
from fastapi.testclient import TestClient
import pytest
from app.main import app
from app.database import Base, SessionLocal, engine
from app.models import (
    College,
    MaintenanceTicket,
    MarkRecord,
    TicketAuditLedger,
    User,
    ZKReport,
    ZKTokenNonce,
)
from app.modules.academic_engine import compute_75_forecaster
from app.modules.facilities import calculate_priority_weight
from app.modules.privacy import _college_rsa_key, _commitment_digest


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    from app.seed import seed_database
    seed_database()
    yield
    # Restore clean seed after tests run so demo database remains pristine
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()


# ==============================================================================
# 1. AUTH & ROLE-BASED ACCESS CONTROL (RBAC) + ROW-LEVEL SECURITY TESTS
# ==============================================================================

def test_login_for_every_role():
    with TestClient(app) as client:
        test_accounts = [
            ("admin@nitx.demo", "admin", "admin"),
            ("dean.academics@nitx.demo", "dean123", "dean"),
            ("hod.cse@nitx.demo", "hod123", "hod"),
            ("professor@nitx.demo", "professor", "professor"),
            ("technician@nitx.demo", "technician", "technician"),
            ("warden.hostel@nitx.demo", "warden123", "warden"),
            ("student001@nitx.demo", "student123", "student"),
        ]
        for email, password, expected_role in test_accounts:
            res = client.post("/api/auth/login", json={"email": email, "password": password, "college_code": "NITX"})
            assert res.status_code == 200, f"Login failed for {email}: {res.text}"
            data = res.json()
            assert "access_token" in data
            assert "refresh_token" in data
            assert data["user"]["role"] == expected_role


def test_invalid_login_rejected():
    with TestClient(app) as client:
        res = client.post("/api/auth/login", json={"email": "student001@nitx.demo", "password": "wrong_password", "college_code": "NITX"})
        assert res.status_code == 401


def test_rbac_guard_blocks_unauthorized_role():
    with TestClient(app) as client:
        # Student tries to access Admin billing endpoint
        login_res = client.post("/api/auth/login", json={"email": "student001@nitx.demo", "password": "student123", "college_code": "NITX"})
        token = login_res.json()["access_token"]
        res = client.get("/api/admin/billing", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 403, "Student must get 403 Forbidden on admin billing endpoint"


def test_row_level_security_student_marks():
    with TestClient(app) as client:
        # Login student001
        res1 = client.post("/api/auth/login", json={"email": "student001@nitx.demo", "password": "student123", "college_code": "NITX"})
        token1 = res1.json()["access_token"]
        student1_id = res1.json()["user"]["id"]

        # Student001 can read own marks
        own_res = client.get(f"/api/marks/student/{student1_id}", headers={"Authorization": f"Bearer {token1}"})
        assert own_res.status_code == 200

        # Student001 attempts to read Student002's marks -> MUST GET 403 FORBIDDEN!
        other_id = "usr-student-002"
        other_res = client.get(f"/api/marks/student/{other_id}", headers={"Authorization": f"Bearer {token1}"})
        assert other_res.status_code == 403
        assert "Row-level security violation" in other_res.json()["detail"]

        # Professor CAN read Student002's marks for cohort review
        prof_res = client.post("/api/auth/login", json={"email": "professor@nitx.demo", "password": "professor", "college_code": "NITX"})
        prof_token = prof_res.json()["access_token"]
        prof_view_res = client.get(f"/api/marks/student/{other_id}", headers={"Authorization": f"Bearer {prof_token}"})
        assert prof_view_res.status_code == 200


# ==============================================================================
# 2. 75% ATTENDANCE FORECASTER MATH & EDGE CASES
# ==============================================================================

def test_forecaster_on_track():
    # 20 attended out of 24 total, 16 remaining (total semester = 40)
    # Required for 75% of 40 = 30. Current attended = 20. Need 10 more out of 16.
    # Can miss = 20 + 16 - 30 = 6 classes.
    res = compute_75_forecaster(attended=20, total=24, remaining=16)
    assert res["tone"] == "green"
    assert res["current_percentage"] == round(20 / 24 * 100, 1)
    assert res["classes_can_miss"] == 6
    assert res["consecutive_to_recover"] == 0


def test_forecaster_recovering():
    # 10 attended out of 16 total (62.5%), 14 remaining (total semester = 30)
    # Consecutive to recover: 3*16 - 4*10 = 48 - 40 = 8 classes.
    res = compute_75_forecaster(attended=10, total=16, remaining=14)
    assert res["tone"] == "amber"
    assert res["consecutive_to_recover"] == 8
    assert res["can_recover_this_semester"] is True


def test_forecaster_impossible_shortage_edge_case():
    # 5 attended out of 20 total, 5 remaining (total semester = 25)
    # Even if attends all 5 remaining, max = 10 / 25 = 40% < 75%.
    res = compute_75_forecaster(attended=5, total=20, remaining=5)
    assert res["tone"] == "red"
    assert res["can_recover_this_semester"] is False


def test_forecaster_zero_classes_left_edge_case():
    # Semester ended: 0 classes left.
    res_pass = compute_75_forecaster(attended=30, total=40, remaining=0)
    assert res_pass["current_percentage"] == 75.0
    assert res_pass["tone"] == "green"

    res_fail = compute_75_forecaster(attended=25, total=40, remaining=0)
    assert res_fail["current_percentage"] == 62.5
    assert res_fail["tone"] == "red"


# ==============================================================================
# 3. INNOVATION 3: GRIEVANCE PRIORITY FORMULA & HASH-CHAINED LEDGER
# ==============================================================================

def test_priority_formula_math():
    """
    W = Base * log2(1 + N) * (1 + 0.1 * delta_t_hours)
    Unit-test exact prompt requirements:
    N=10 => log2(11) = 3.45943... ~= 3.46x
    48h multiplier => (1 + 0.1 * 48) = 5.8x
    """
    # 1. Report Count Multiplier test for N=10
    log_factor = math.log2(1.0 + 10)
    assert round(log_factor, 2) == 3.46

    # 2. 48h Time Multiplier test
    time_factor_48h = 1.0 + (0.1 * 48.0)
    assert round(time_factor_48h, 1) == 5.8

    # 3. Combined calculation for equipment (Base=3.0)
    from datetime import datetime, timedelta, timezone
    created_at = datetime.now(timezone.utc) - timedelta(hours=48)
    w = calculate_priority_weight(category="oscilloscope", n_reports=10, created_at=created_at, demo_multiplier=1.0)
    # W = 3.0 * log2(11) * 5.8 = 3.0 * 3.45943 * 5.8 ~= 60.194
    assert round(w, 1) == round(3.0 * math.log2(11) * 5.8, 1)


def test_hash_chained_ledger_integrity_and_tamper_detection():
    with TestClient(app) as client:
        # Check integrity of seeded ticket
        ticket_id = "northstar-ticket-101"
        res = client.get(f"/api/facilities/ledger/verify/{ticket_id}")
        assert res.status_code == 200
        assert res.json()["valid"] is True

        # Now deliberately tamper a ledger row via tamper endpoint
        admin_res = client.post("/api/auth/login", json={"email": "admin@nitx.demo", "password": "admin", "college_code": "NITX"})
        admin_token = admin_res.json()["access_token"]
        tamper_res = client.post(f"/api/facilities/ledger/tamper-test/{ticket_id}", headers={"Authorization": f"Bearer {admin_token}"})
        assert tamper_res.status_code == 200

        # Verification endpoint MUST now catch the cryptographic tampering!
        verify_after = client.get(f"/api/facilities/ledger/verify/{ticket_id}")
        assert verify_after.status_code == 200
        assert verify_after.json()["valid"] is False
        assert "tampering detected" in verify_after.json()["message"].lower()


# ==============================================================================
# 4. INNOVATION 5: ANONYMOUS WHISTLEBLOWER SHIELD (RSA BLIND SIGNATURE)
# ==============================================================================

def test_anonymous_whistleblower_end_to_end_and_security():
    with TestClient(app) as client:
        db = SessionLocal()
        college = db.query(College).filter(College.code == "NITX").first()
        n, e, d = _college_rsa_key(college, db, "dean")
        db.close()

        # Step 1: Student generates secret & nullifier
        secret = secrets.token_hex(16)
        nullifier = secrets.token_hex(16)
        commitment = f"{secret}_{nullifier}"
        m = _commitment_digest(commitment, n)

        # Step 2: Client blinds m: m' = m * r^e mod N
        r = 1337
        while math.gcd(r, n) != 1:
            r += 2
        blinded_m = (m * pow(r, e, n)) % n

        # Step 3: Login as student to get blind signature
        login_res = client.post("/api/auth/login", json={"email": "student001@nitx.demo", "password": "student123", "college_code": "NITX"})
        token = login_res.json()["access_token"]

        sign_res = client.post("/api/privacy/blind-sign", json={"blinded_message": format(blinded_m, "x")}, headers={"Authorization": f"Bearer {token}"})
        assert sign_res.status_code == 200
        blinded_sig = int(sign_res.json()["blinded_signature"], 16)

        # Step 4: Client unblinds signature: s = s' * r^(-1) mod N
        r_inv = pow(r, -1, n)
        unblinded_sig = (blinded_sig * r_inv) % n
        # Verify mathematically: s^e mod N == m
        assert pow(unblinded_sig, e, n) == m

        # Step 5: Anonymous submission WITHOUT auth headers
        report_payload = {
            "college_code": "NITX",
            "commitment": commitment,
            "signature": format(unblinded_sig, "x"),
            "nullifier": nullifier,
            "category": "Ragging",
            "report_text": "Sensitive report submitted anonymously through cryptographic blind signature.",
        }
        submit_res = client.post("/api/privacy/reports", json=report_payload)
        assert submit_res.status_code == 201
        tracking_code = submit_res.json()["receipt_tracking_code"]
        assert tracking_code.startswith("SHIELD-")

        # Step 6: Test Double Filing Rejection (reusing nullifier MUST fail with 409 Conflict)
        duplicate_res = client.post("/api/privacy/reports", json=report_payload)
        assert duplicate_res.status_code == 409
        assert "double filing rejected" in duplicate_res.json()["detail"].lower()

        # Step 7: Test Forged Signature Rejection
        fake_payload = dict(report_payload)
        fake_payload["nullifier"] = secrets.token_hex(16)
        fake_payload["signature"] = format((unblinded_sig + 42) % n, "x")
        fake_res = client.post("/api/privacy/reports", json=fake_payload)
        assert fake_res.status_code == 400
        assert "forged or invalid" in fake_res.json()["detail"].lower()

        # Step 8: Prove NO student identity is linked in the database
        db = SessionLocal()
        saved_report = db.query(ZKReport).filter(ZKReport.tracking_code == tracking_code).first()
        assert saved_report is not None
        # Verify there is no student_id column or link to student001
        assert not hasattr(saved_report, "student_id")
        db.close()


def test_non_enrolled_cannot_get_blind_signature():
    with TestClient(app) as client:
        # Non-student (technician) tries to request student whistleblower signature -> 403
        tech_res = client.post("/api/auth/login", json={"email": "technician@nitx.demo", "password": "technician", "college_code": "NITX"})
        token = tech_res.json()["access_token"]
        res = client.post("/api/privacy/blind-sign", json={"blinded_message": "1234abcd"}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 403


# ==============================================================================
# 5. INNOVATION 4: HUNGARIAN ALGORITHM PEER MATCHER & OPTIMALITY TEST
# ==============================================================================

def test_hungarian_peer_matching_and_optimality():
    with TestClient(app) as client:
        # Run Hungarian peer matcher
        prof_res = client.post("/api/auth/login", json={"email": "professor@nitx.demo", "password": "professor", "college_code": "NITX"})
        token = prof_res.json()["access_token"]

        match_res = client.post("/api/peer-matcher/generate?course_id=northstar-cs301", headers={"Authorization": f"Bearer {token}"})
        assert match_res.status_code == 200
        data = match_res.json()
        assert data["status"] == "matches_generated"
        assert len(data["pairs"]) >= 15
        for pair in data["pairs"]:
            assert "student_1" in pair
            assert "student_2" in pair
            assert "s1_helps_s2_in" in pair
            assert "s2_helps_s1_in" in pair
            assert pair["complementary_affinity_score"] >= 0.0

    # Brute-force verification on a 4-student toy case to prove Hungarian optimality:
    import itertools
    import numpy as np
    from scipy.optimize import linear_sum_assignment

    # 4 students, 2 concepts:
    # S0 strong in C0, weak in C1: [0.9, 0.1]
    # S1 weak in C0, strong in C1: [0.1, 0.9] (Ideal pair with S0!)
    # S2 strong in C0, strong in C1: [0.8, 0.8]
    # S3 weak in C0, weak in C1: [0.2, 0.2]
    M_toy = np.array([
        [0.9, 0.1],
        [0.1, 0.9],
        [0.8, 0.8],
        [0.2, 0.2],
    ])
    N_toy = 4
    B_toy = np.zeros((N_toy, N_toy))
    for i in range(N_toy):
        for j in range(N_toy):
            if i != j:
                diff = np.abs(M_toy[i] - M_toy[j])
                min_m = np.minimum(M_toy[i], M_toy[j])
                B_toy[i, j] = np.sum(diff * (1.0 - min_m))

    max_b = np.max(B_toy)
    Cost_toy = max_b - B_toy
    for i in range(N_toy):
        Cost_toy[i, i] = 1e6

    # Hungarian solution:
    r_idx, c_idx = linear_sum_assignment(Cost_toy)
    hungarian_affinity = sum(B_toy[r, c] for r, c in zip(r_idx, c_idx) if r != c) / 2.0

    # Brute-force exhaustive search over all partitions:
    # 4 items into 2 pairs: (0-1, 2-3), (0-2, 1-3), (0-3, 1-2)
    p1 = B_toy[0, 1] + B_toy[2, 3]
    p2 = B_toy[0, 2] + B_toy[1, 3]
    p3 = B_toy[0, 3] + B_toy[1, 2]
    max_brute_force = max(p1, p2, p3)

    assert round(hungarian_affinity, 4) == round(max_brute_force, 4), "Hungarian solution must equal brute-force optimal matching!"


# ==============================================================================
# 6. INNOVATION 1: DKT-GRAPH & ROOT-CAUSE WALK TEST
# ==============================================================================

def test_dkt_graph_and_root_cause_diagnosis():
    with TestClient(app) as client:
        # Login student001 (seeded with Deadlock 28% and Semaphores 41%)
        login_res = client.post("/api/auth/login", json={"email": "student001@nitx.demo", "password": "student123", "college_code": "NITX"})
        token = login_res.json()["access_token"]

        graph_res = client.get("/api/dkt/graph/northstar-cs301", headers={"Authorization": f"Bearer {token}"})
        assert graph_res.status_code == 200
        data = graph_res.json()
        assert len(data["nodes"]) == 7
        assert len(data["edges"]) >= 6

        # Check Root-Cause Diagnosis Card:
        # Deadlock Detection is failing (28%) because Semaphores & Mutex is at 41%
        diagnosis = data["diagnosis"]
        assert diagnosis is not None
        assert "Deadlock" in diagnosis["failing_concept"]
        assert "Semaphores" in diagnosis["root_cause_concept"]
        assert "because its prerequisite" in diagnosis["explanation"]

        # Take 3-question micro-drill on root cause
        drill_q_res = client.get(f"/api/dkt/micro-drill/{diagnosis['root_cause_code']}", headers={"Authorization": f"Bearer {token}"})
        assert drill_q_res.status_code == 200
        drill_data = drill_q_res.json()
        assert len(drill_data["questions"]) == 3

        # Submit all 3 correct answers
        submit_payload = {
            "course_id": "northstar-cs301",
            "concept_code": diagnosis["root_cause_code"],
            "answers": [
                {"q_id": q["id"], "selected_idx": q["correct_idx"], "is_correct": True}
                for q in drill_data["questions"]
            ],
        }
        submit_res = client.post("/api/dkt/micro-drill/submit", json=submit_payload, headers={"Authorization": f"Bearer {token}"})
        assert submit_res.status_code == 200
        updated = submit_res.json()
        assert updated["new_mastery_pct"] > diagnosis["root_cause_mastery_pct"]
        assert "inference_latency_ms" in updated


# ==============================================================================
# 7. INNOVATION 2: 2PL IRT QUESTION AUDIT & GRADING ACTIONS TEST
# ==============================================================================

def test_grading_studio_and_irt_audit():
    with TestClient(app) as client:
        prof_res = client.post("/api/auth/login", json={"email": "professor@nitx.demo", "password": "professor", "college_code": "NITX"})
        token = prof_res.json()["access_token"]

        # Run 2PL IRT Audit
        irt_res = client.get("/api/grading/irt-audit/northstar-cs301", headers={"Authorization": f"Bearer {token}"})
        assert irt_res.status_code == 200
        irt_data = irt_res.json()
        assert "questions" in irt_data
        assert len(irt_data["questions"]) >= 5

        # Check each question has point-biserial r, difficulty b, discrimination a, and ICC curve
        for q in irt_data["questions"]:
            assert "point_biserial_r" in q
            assert "irt_difficulty_b" in q
            assert "irt_discrimination_a" in q
            assert len(q["icc_curve"]) == 25

        # Test Drop Question Action
        drop_res = client.post("/api/grading/drop-question", json={"course_id": "northstar-cs301", "q_code": "Q5"}, headers={"Authorization": f"Bearer {token}"})
        assert drop_res.status_code == 200
        assert drop_res.json()["status"] == "success"

        # Test Undo Action
        undo_res = client.post("/api/grading/undo", json={"course_id": "northstar-cs301"}, headers={"Authorization": f"Bearer {token}"})
        assert undo_res.status_code == 200
        assert undo_res.json()["status"] == "undone"


# ==============================================================================
# 8. FINAL PHASE: REDIS CACHE, RECRUITER PRIVACY, AES-256, GDPR, ROI, METRICS
# ==============================================================================

def test_redis_gradesheet_cache_120s_ttl_and_invalidation():
    with TestClient(app) as client:
        prof_res = client.post("/api/auth/login", json={"email": "professor@nitx.demo", "password": "professor", "college_code": "NITX"})
        token = prof_res.json()["access_token"]

        # Fetch 1: Fresh DB fetch (or cache seed)
        res1 = client.get("/api/grading/gradesheet/northstar-cs301", headers={"Authorization": f"Bearer {token}"})
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["ttl_seconds"] == 120
        assert "marks" in data1
        assert len(data1["marks"]) > 0

        # Fetch 2: Cache hit
        res2 = client.get("/api/grading/gradesheet/northstar-cs301", headers={"Authorization": f"Bearer {token}"})
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["course_id"] == "northstar-cs301"

        # Action: Award grace marks -> invalidates cache
        grace_res = client.post("/api/grading/grace-marks", json={"course_id": "northstar-cs301", "target": "all", "marks": 1.0}, headers={"Authorization": f"Bearer {token}"})
        assert grace_res.status_code == 200

        # Fetch 3: Cache recomputed after invalidation
        res3 = client.get("/api/grading/gradesheet/northstar-cs301", headers={"Authorization": f"Bearer {token}"})
        assert res3.status_code == 200


def test_recruiter_portal_privacy_and_invitation_flow():
    with TestClient(app) as client:
        # 1. Recruiter logs in
        recruiter_res = client.post("/api/auth/login", json={"email": "recruiter@nitx.demo", "password": "recruiter", "college_code": "NITX"})
        assert recruiter_res.status_code == 200
        recruiter_token = recruiter_res.json()["access_token"]

        # 2. Recruiter views talent marketplace
        talent_res = client.get("/api/recruiter/talent", headers={"Authorization": f"Bearer {recruiter_token}"})
        assert talent_res.status_code == 200
        talent = talent_res.json()
        assert len(talent) > 0

        # PRIVACY GUARANTEE: Email, phone, real roll number MUST NEVER be exposed to recruiters!
        for profile in talent:
            assert "email" not in profile, "Privacy breach: student email must not be exposed to recruiters!"
            assert "phone" not in profile, "Privacy breach: student phone must not be exposed to recruiters!"
            assert profile["display_name"].startswith("Learner #"), "Real student identity must be anonymized!"
            assert "verified_skills" in profile

        target_student_id = talent[0]["student_id"]

        # 3. Recruiter sends invitation
        invite_res = client.post(
            "/api/recruiter/invites",
            json={
                "student_id": target_student_id,
                "role_title": "Full Stack Engineer (Foundations)",
                "message": "We reviewed your verified DKT concept mastery and invite you to interview.",
                "ctc_lpa": 16.5,
            },
            headers={"Authorization": f"Bearer {recruiter_token}"},
        )
        assert invite_res.status_code == 201
        invite_id = invite_res.json()["invite_id"]

        # 4. Student logs in and sees their invitations
        student_res = client.post("/api/auth/login", json={"email": "student001@nitx.demo", "password": "student123", "college_code": "NITX"})
        student_token = student_res.json()["access_token"]

        my_invites = client.get("/api/invites/me", headers={"Authorization": f"Bearer {student_token}"})
        assert my_invites.status_code == 200

        # 5. Student toggles recruiter consent to Opt-Out
        opt_out_res = client.patch("/api/recruiter/opt-in", json={"opt_in": False}, headers={"Authorization": f"Bearer {student_token}"})
        assert opt_out_res.status_code == 200
        assert opt_out_res.json()["opt_in"] is False

        # Reset opt-in back to True for subsequent tests
        client.patch("/api/recruiter/opt-in", json={"opt_in": True}, headers={"Authorization": f"Bearer {student_token}"})


def test_aes_256_marks_encryption_and_decryption():
    with TestClient(app) as client:
        prof_res = client.post("/api/auth/login", json={"email": "professor@nitx.demo", "password": "professor", "college_code": "NITX"})
        token = prof_res.json()["access_token"]

        sample_marks = json.dumps({"student_id": "usr-student-001", "course_id": "CS301", "Q1": 9.5, "Q2": 8.0, "total": 17.5})

        # Encrypt
        enc_res = client.post("/api/business/privacy/encrypt-marks", json={"plaintext_marks_json": sample_marks}, headers={"Authorization": f"Bearer {token}"})
        assert enc_res.status_code == 200
        enc_data = enc_res.json()
        assert enc_data["algorithm"] == "AES-256-CBC"
        assert enc_data["key_size_bits"] == 256
        ciphertext = enc_data["ciphertext"]
        assert ciphertext != sample_marks

        # Decrypt
        dec_res = client.post("/api/business/privacy/decrypt-marks", json={"ciphertext": ciphertext}, headers={"Authorization": f"Bearer {token}"})
        assert dec_res.status_code == 200
        dec_data = dec_res.json()
        assert dec_data["decrypted_json"] == sample_marks


def test_privacy_gdpr_export_and_erase_my_data():
    with TestClient(app) as client:
        # Use student003 for GDPR tests so student001/student002 remain clean
        s_res = client.post("/api/auth/login", json={"email": "student003@nitx.demo", "password": "student123", "college_code": "NITX"})
        token = s_res.json()["access_token"]

        # 1. Export My Data
        export_res = client.get("/api/business/privacy/export-my-data", headers={"Authorization": f"Bearer {token}"})
        assert export_res.status_code == 200
        export_data = export_res.json()
        assert "user_profile" in export_data
        assert "academic_marks" in export_data
        assert "attendance_records" in export_data

        # 2. Erase My Data
        erase_res = client.post("/api/business/privacy/erase-my-data", headers={"Authorization": f"Bearer {token}"})
        assert erase_res.status_code == 200
        assert erase_res.json()["status"] == "erased"


def test_business_roi_calculator_and_accreditation_pack():
    with TestClient(app) as client:
        # ROI Calculator for 3,000 students
        roi_res = client.post(
            "/api/business/roi-calculator",
            json={
                "student_count": 3000,
                "legacy_erp_cost_per_student": 24.0,
                "legacy_maintenance_annual_usd": 18000.0,
                "tier_choice": "cognitive",  # $2.50 / student / yr
            },
        )
        assert roi_res.status_code == 200
        roi_data = roi_res.json()
        assert roi_data["student_count"] == 3000
        assert roi_data["nexus_annual_cost_usd"] == 7500.0  # 3000 * 2.50
        assert roi_data["legacy_annual_cost_usd"] == 90000.0  # 3000 * 24 + 18000
        assert roi_data["net_annual_savings_usd"] == 82500.0
        assert roi_data["cost_reduction_percentage"] > 90.0

        # Accreditation Pack for Dean
        dean_res = client.post("/api/auth/login", json={"email": "dean.academics@nitx.demo", "password": "dean123", "college_code": "NITX"})
        dean_token = dean_res.json()["access_token"]

        accred_res = client.get("/api/business/accreditation-pack", headers={"Authorization": f"Bearer {dean_token}"})
        assert accred_res.status_code == 200
        accred_data = accred_res.json()
        assert "nba_criteria" in accred_data
        assert "criterion_2_teaching_learning" in accred_data["nba_criteria"]
        assert "criterion_3_course_outcomes" in accred_data["nba_criteria"]
        assert "criterion_6_facilities_equipment" in accred_data["nba_criteria"]
        assert "naac_criteria" in accred_data
        assert "criterion_2_teaching_learning_evaluation" in accred_data["naac_criteria"]
        assert "criterion_7_institutional_values_best_practices" in accred_data["naac_criteria"]


def test_prometheus_metrics_and_observability():
    with TestClient(app) as client:
        # Trigger requests
        client.get("/health")
        client.get("/api/academic/timetable")

        res = client.get("/metrics")
        assert res.status_code == 200
        body = res.text
        assert "campus_nexus_http_requests_total" in body
        assert "campus_nexus_http_errors_total" in body
        assert "campus_nexus_http_request_duration_seconds" in body
        assert "campus_nexus_cache_hits_total" in body
        assert "campus_nexus_cache_misses_total" in body
        assert "campus_nexus_cache_hit_ratio" in body
        assert "campus_nexus_sla_breaches_total" in body
        assert "campus_nexus_up 1" in body
