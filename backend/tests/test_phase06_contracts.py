"""Representative v1 API contract tests (run from backend/ with pytest)."""
from fastapi.testclient import TestClient

from app.main import app


def test_validation_error_uses_public_envelope():
    with TestClient(app) as client:
        response = client.post("/api/v1/student/what-if", json={"student_id": "s-1"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_not_ready_features_are_truthful():
    with TestClient(app) as client:
        response = client.post("/api/v1/copilot/ask", json={"course_id": "CS301", "query": "Explain B+ trees"})
    assert response.status_code == 501
    assert response.json()["error"]["code"] == "FEATURE_NOT_READY"


def test_schedule_async_job_can_be_polled():
    payload = {"courses": ["CS301"], "available_slots": ["May 10 Morning"], "rooms": ["Hall A"], "async_mode": True}
    with TestClient(app) as client:
        created = client.post("/api/v1/schedule/solve", json=payload)
        assert created.status_code == 202
        job = client.get(created.json()["status_url"])
    assert job.status_code == 200
    assert job.json()["status"] == "succeeded"
