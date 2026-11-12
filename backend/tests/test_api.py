from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "service": "campus-nexus-api"}


def test_public_colleges():
    res = client.get("/api/colleges/public")
    assert res.status_code == 200
    colleges = res.json()
    assert len(colleges) >= 2
    codes = [c["code"] for c in colleges]
    assert "NITX" in codes
    assert "RBCE" in codes


def test_role_logins():
    roles = [
        ("admin@nitx.demo", "admin", "chancellor_dean"),
        ("professor@nitx.demo", "professor", "professor_hod"),
        ("student001@nitx.demo", "student123", "student"),
        ("technician@nitx.demo", "technician", "technician_warden"),
        ("recruiter@nitx.demo", "recruiter", "recruiter"),
    ]
    for email, password, expected_role in roles:
        res = client.post("/api/auth/login", json={"email": email, "password": password, "college_code": "NITX"})
        assert res.status_code == 200, f"Login failed for {email}: {res.text}"
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == expected_role


def get_token(email: str, password: str, college_code: str = "NITX") -> str:
    res = client.post("/api/auth/login", json={"email": email, "password": password, "college_code": college_code})
    return res.json()["access_token"]


def test_dashboard_overview():
    token = get_token("admin@nitx.demo", "admin")
    res = client.get("/api/dashboard/overview", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "student_count" in data
    assert data["student_count"] > 0
    assert "average_attendance" in data


def test_student_study_and_drills():
    token = get_token("student001@nitx.demo", "student123")
    headers = {"Authorization": f"Bearer {token}"}

    # Knowledge state
    res = client.get("/api/knowledge/me", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # Attendance
    res = client.get("/api/attendance/me", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # Micro drills
    res = client.get("/api/micro-drills", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # Study plan
    res = client.post("/api/study-plan/generate", json={"available_hours_per_day": 1.0, "days": 7}, headers=headers)
    assert res.status_code == 200
    plan = res.json()
    assert "plan" in plan
    assert len(plan["plan"]) > 0


def test_professor_grading_sandbox():
    token = get_token("professor@nitx.demo", "professor")
    headers = {"Authorization": f"Bearer {token}"}

    # Get courses
    res = client.get("/api/grading/courses", headers=headers)
    assert res.status_code == 200
    courses = res.json()
    assert len(courses) > 0
    course_id = courses[0]["id"]

    # Run grading sandbox simulation
    res = client.post(
        "/api/grading/sandbox",
        json={"course_id": course_id, "mean_shift": 2.5, "std_scale": 1.1},
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert "raw_mean" in data
    assert "adjusted_mean" in data
    assert "grade_distribution" in data
    assert "curve" in data
    assert "irt_audit" in data


def test_accreditation_outcomes():
    token = get_token("admin@nitx.demo", "admin")
    res = client.get("/api/accreditation/outcomes", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_facilities_tickets():
    token = get_token("technician@nitx.demo", "technician")
    res = client.get("/api/facilities/tickets", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_privacy_blind_key():
    token = get_token("student001@nitx.demo", "student123")
    res = client.get("/api/privacy/blind-key", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "modulus" in data
    assert "exponent" in data
