from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_job_status_requires_authentication():
    response = client.get("/api/v1/jobs/demo-job")
    assert response.status_code == 401
