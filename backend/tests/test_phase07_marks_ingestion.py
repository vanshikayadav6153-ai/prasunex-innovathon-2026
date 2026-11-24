from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal
from app.models import CourseEnrollment


def _admin_headers(client: TestClient) -> dict[str, str]:
    login = client.post("/api/auth/login", json={"email": "admin@nitx.demo", "password": "admin", "college_code": "NITX"})
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_import_requires_faculty_authentication():
    with TestClient(app) as client:
        response = client.post("/api/v1/marks/ingest-csv", json={"course_id": "northstar-cs301", "rows": []})
    assert response.status_code == 401


def test_preview_then_confirm_persists_question_scores_and_is_idempotent():
    with TestClient(app) as client:
        headers = _admin_headers(client)
        db = SessionLocal()
        enrollment = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == "northstar-cs301").first()
        assert enrollment is not None
        student_id = enrollment.student_id
        db.close()
        payload = {
            "course_id": "northstar-cs301",
            "idempotency_key": "phase07-contract-import",
            "rows": [{"student_identifier": student_id, "question_scores": {"Q1": 8, "Q2": 9, "Q3": 12, "Q4": 13, "Q5": 17}, "reported_total": 59}],
        }
        preview = client.post("/api/v1/marks/ingest-csv", json=payload, headers=headers)
        assert preview.status_code == 201
        assert preview.json()["valid_rows"] == 1
        repeated = client.post("/api/v1/marks/ingest-csv", json=payload, headers=headers)
        assert repeated.status_code == 201
        assert repeated.json()["idempotent"] is True
        committed = client.post(f"/api/v1/marks/imports/{preview.json()['import_id']}/confirm", json={}, headers=headers)
    assert committed.status_code == 200
    assert committed.json()["analytics_ready"] is True


def test_mismatched_total_stays_in_review_and_cannot_commit():
    with TestClient(app) as client:
        headers = _admin_headers(client)
        payload = {"course_id": "northstar-cs301", "rows": [{"student_identifier": "usr-student-001", "question_scores": {"Q1": 8}, "reported_total": 2}]}
        preview = client.post("/api/v1/marks/ingest-csv", json=payload, headers=headers)
        assert preview.status_code == 201
        assert preview.json()["invalid_rows"] == 1
        committed = client.post(f"/api/v1/marks/imports/{preview.json()['import_id']}/confirm", json={}, headers=headers)
    assert committed.status_code == 422
