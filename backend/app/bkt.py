"""Deterministic, explainable Bayesian Knowledge Tracing baseline.

For an observed correct response C:
P(L|C) = P(L)(1-S) / [P(L)(1-S) + (1-P(L))G]
For a wrong response W:
P(L|W) = P(L)S / [P(L)S + (1-P(L))(1-G)]
After either observation: P(L_next) = P(L|obs) + (1-P(L|obs))T.
Missing observations do not update the state.
"""
from __future__ import annotations

P_L0 = 0.30
P_TRANSIT = 0.15
P_GUESS = 0.20
P_SLIP = 0.10


def posterior(prior: float, correct: bool | None) -> tuple[float, float]:
    """Return (posterior_before_learning, next_mastery) with exact BKT params."""
    prior = min(1.0, max(0.0, float(prior)))
    if correct is None:
        return prior, prior
    if correct:
        observed = (prior * (1 - P_SLIP)) / ((prior * (1 - P_SLIP)) + ((1 - prior) * P_GUESS))
    else:
        observed = (prior * P_SLIP) / ((prior * P_SLIP) + ((1 - prior) * (1 - P_GUESS)))
    return observed, observed + (1 - observed) * P_TRANSIT


def update(prior: float, correct: bool | None) -> float:
    return round(posterior(prior, correct)[1], 8)


def confidence_label(attempts: int) -> tuple[str, str]:
    if attempts == 0:
        return "none", "No attempts yet; showing the 0.30 baseline prior."
    if attempts < 3:
        return "low", "Fewer than 3 attempts: mastery estimate is preliminary."
    if attempts < 8:
        return "medium", "Fewer than 8 attempts: use this estimate with caution."
    return "higher", "Estimate is based on 8 or more observed attempts."
