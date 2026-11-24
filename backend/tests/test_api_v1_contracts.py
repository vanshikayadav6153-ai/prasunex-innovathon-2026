from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_contract_inventory_lists_spec_routes():
    response = client.get("/api/v1/contracts")
    assert response.status_code == 200
    body = response.json()
    assert len(body["routes"]) == 14
    assert "POST /api/v1/grievance/submit" in body["routes"]
    assert "WS /ws/v1/sla-tracker/{id}" in body["routes"]


def test_sensitive_zk_contract_is_truthfully_not_ready():
    response = client.post(
        "/api/v1/auth/zk-proof",
        json={"proof": "demo", "merkle_root": "root", "nullifier": "n1", "signal": "campus"},
    )
    assert response.status_code == 501
    assert response.json()["error"]["code"] == "capability_not_ready"
    assert "threat-model" in response.json()["error"]["prerequisite"]


def test_protected_contract_requires_authentication():
    response = client.post(
        "/api/v1/student/what-if",
        json={"course_id": "cs201", "study_hours": {"OS-PROC": 2}},
    )
    assert response.status_code == 401


def test_protected_contract_authenticates_before_business_validation():
    response = client.post(
        "/api/v1/grading/simulate",
        json={"course_id": "cs201", "mode": "invented", "mean_shift": 0, "std_scale": 1},
    )
    assert response.status_code == 401
