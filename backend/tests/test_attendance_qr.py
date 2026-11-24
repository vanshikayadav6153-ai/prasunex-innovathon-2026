import pytest

from app import attendance_qr as qr

BASE = float((1_700_000_000 // qr.STEP_SECONDS) * qr.STEP_SECONDS)  # start of a window


@pytest.fixture(autouse=True)
def _secret(monkeypatch):
    monkeypatch.setenv("ATTENDANCE_QR_SECRET", "test-secret-not-for-production")


def _token(now=BASE, session="sess-1"):
    return qr.issue_token(session, now=now)["token"]


def test_fresh_token_verifies():
    result = qr.verify_token(_token(), now=BASE + 5)
    assert result.ok and result.reason == "ok" and result.session_id == "sess-1"


def test_previous_window_still_accepted():
    assert qr.verify_token(_token(), now=BASE + qr.STEP_SECONDS).ok


def test_expired_after_two_windows():
    result = qr.verify_token(_token(), now=BASE + 2 * qr.STEP_SECONDS)
    assert not result.ok and result.reason == "expired"


def test_future_window_rejected():
    result = qr.verify_token(_token(), now=BASE - qr.STEP_SECONDS)
    assert not result.ok and result.reason == "from_future"


def test_tampered_signature_rejected():
    t = _token()
    bad = t[:-1] + ("0" if t[-1] != "0" else "1")
    assert qr.verify_token(bad, now=BASE).reason == "bad_signature"


def test_tampered_session_rejected():
    parts = _token().split(":")
    parts[1] = "sess-2"
    assert qr.verify_token(":".join(parts), now=BASE).reason == "bad_signature"


def test_forged_newer_window_rejected():
    parts = _token().split(":")
    parts[2] = str(int(parts[2]) + 1)
    assert qr.verify_token(":".join(parts), now=BASE + qr.STEP_SECONDS).reason == "bad_signature"


def test_token_from_other_secret_rejected(monkeypatch):
    t = _token()
    monkeypatch.setenv("ATTENDANCE_QR_SECRET", "a-different-secret")
    assert qr.verify_token(t, now=BASE).reason == "bad_signature"


@pytest.mark.parametrize("bad", ["", "abc", "cnx1:a:b:c", "cnx1:sess-1:123", "x" * 500, None, 42, "cnx1:sess-1:12:\u00e4"])
def test_malformed_tokens_rejected(bad):
    result = qr.verify_token(bad, now=BASE)
    assert not result.ok and result.reason == "malformed"


@pytest.mark.parametrize("bad_session", ["a:b", "", "x" * 65, "has space", None])
def test_invalid_session_id_cannot_be_issued(bad_session):
    with pytest.raises(ValueError):
        qr.issue_token(bad_session, now=BASE)


def test_rotates_in_counts_down():
    assert qr.issue_token("s", now=BASE)["rotates_in"] == qr.STEP_SECONDS
    assert qr.issue_token("s", now=BASE + 4.2)["rotates_in"] == qr.STEP_SECONDS - 4