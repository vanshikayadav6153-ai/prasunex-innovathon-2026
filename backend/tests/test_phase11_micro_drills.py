from datetime import datetime, timezone
import uuid

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app
from app.modules.study import is_card_due, retention
from app.seed import seed_database

Base.metadata.create_all(bind=engine)
seed_database()

client = TestClient(app)


def _student_headers():
    login = client.post("/api/auth/login", json={
        "email": "student001@nitx.demo", "password": "student123", "college_code": "NITX"
    })
    assert login.status_code == 200, login.text
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_simplified_retention_formula_boundaries_and_due_threshold():
    assert retention(0, 1) == pytest.approx(1.0)
    assert retention(1, 1) == pytest.approx(0.9)
    assert retention(9, 1) == pytest.approx(0.5)
    assert retention(-2, 1) == pytest.approx(1.0)
    assert retention(1, 1.2) > retention(1, 1)


def test_new_forgotten_and_future_cards_have_deterministic_due_state():
    now = datetime(2026, 11, 24, 12, tzinfo=timezone.utc)
    assert is_card_due(now, 1.0, now)  # new card
    assert is_card_due(now, retention(2.0, 1.0), now)  # forgotten past the 90% threshold
    assert not is_card_due(datetime(2026, 11, 25, 12, tzinfo=timezone.utc), 1.0, now)


def test_answer_submission_is_idempotent_and_updates_card_once():
    headers = _student_headers()
    queue = client.get("/api/micro-drills?timezone=Asia%2FKolkata", headers=headers)
    assert queue.status_code == 200, queue.text
    assert isinstance(queue.json(), list)
    assert queue.json(), "seed should provide teacher-reviewed low-mastery questions"
    card = queue.json()[0]
    body = {"card_id": card["card_id"], "question_id": card["question_id"],
            "selected_idx": 0, "confidence": 3, "idempotency_key": f"phase11-repeat-{uuid.uuid4().hex}"}
    first = client.post("/api/micro-drills/answer", json=body, headers=headers)
    repeated = client.post("/api/micro-drills/answer", json=body, headers=headers)
    assert first.status_code == repeated.status_code == 200
    assert repeated.json()["duplicate"] is True
    assert repeated.json()["attempt_id"] == first.json()["attempt_id"]
    assert repeated.json()["stability"] == pytest.approx(first.json()["stability"])
    expected_stability = first.json()["stability_before"] * (1.2 if first.json()["is_correct"] else 0.5)
    assert first.json()["stability"] == pytest.approx(expected_stability)
    refreshed = client.get("/api/micro-drills", headers=headers).json()
    updated_card = next(item for item in refreshed if item["card_id"] == card["card_id"])
    assert updated_card["stability_days"] == pytest.approx(first.json()["stability"])
    assert updated_card["next_due"] == first.json()["next_due"]
    history = client.get("/api/micro-drills/history", headers=headers).json()
    assert sum(item["attempt_id"] == first.json()["attempt_id"] for item in history) == 1


def test_timezone_reminders_dedupe_and_reject_dst_gap():
    headers = _student_headers()
    queue = client.get("/api/micro-drills", headers=headers).json()
    assert queue, "seed should provide teacher-reviewed low-mastery questions"
    card_id = queue[0]["card_id"]
    local = datetime.now(timezone.utc).replace(tzinfo=None)
    # A future instant with local wall-time semantics in Kolkata.
    from datetime import timedelta
    scheduled = (local + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0)
    payload = {"scheduled_local": scheduled.isoformat(), "timezone": "Asia/Kolkata"}
    first = client.post(f"/api/micro-drills/{card_id}/reminder", json=payload, headers=headers)
    second = client.post(f"/api/micro-drills/{card_id}/reminder", json=payload, headers=headers)
    assert first.status_code == second.status_code == 200
    assert first.json()["id"] == second.json()["id"]
    assert second.json()["deduplicated"] is True

    dst_gap = client.post(f"/api/micro-drills/{card_id}/reminder", json={
        "scheduled_local": "2027-03-14T02:30:00", "timezone": "America/New_York"
    }, headers=headers)
    assert dst_gap.status_code == 422
    dst_fold = client.post(f"/api/micro-drills/{card_id}/reminder", json={
        "scheduled_local": "2027-11-07T01:30:00", "timezone": "America/New_York"
    }, headers=headers)
    assert dst_fold.status_code == 200
    assert dst_fold.json()["scheduled_for"].startswith("2027-11-07T05:30:00")


def test_empty_micro_drill_queue_serializes_as_empty_list():
    headers = _student_headers()
    empty = client.get("/api/micro-drills?course_id=no-such-course", headers=headers)
    assert empty.status_code == 200
    assert empty.json() == []
