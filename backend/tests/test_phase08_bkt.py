import pytest

from app.bkt import P_L0, posterior, update
from app.modules.learning_analytics import _assert_acyclic
from fastapi import HTTPException


def test_bkt_correct_and_wrong_posteriors_match_source_equations():
    observed_correct, next_correct = posterior(P_L0, True)
    observed_wrong, next_wrong = posterior(P_L0, False)
    assert observed_correct == pytest.approx((0.30 * 0.90) / ((0.30 * 0.90) + (0.70 * 0.20)))
    assert next_correct == pytest.approx(observed_correct + (1 - observed_correct) * 0.15)
    assert observed_wrong == pytest.approx((0.30 * 0.10) / ((0.30 * 0.10) + (0.70 * 0.80)))
    assert next_wrong < next_correct


def test_missing_answer_and_boundaries_do_not_break_bkt():
    assert update(P_L0, None) == P_L0
    assert 0 <= update(0, True) <= 1
    assert 0 <= update(1, False) <= 1


def test_cycle_and_unknown_prerequisite_are_rejected():
    with pytest.raises(HTTPException):
        _assert_acyclic({"A": ["B"], "B": ["A"]})
    with pytest.raises(HTTPException):
        _assert_acyclic({"A": ["missing"]})
