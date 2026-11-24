"""Consent-gated PyTorch DKT interface.

This module intentionally has no training side effect. Training is permitted
only when a consented dataset path and a validation-approved checkpoint policy
are supplied by the deployment; production analytics continue to use BKT until
then.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence


@dataclass(frozen=True)
class DKTModelStatus:
    status: str = "BLOCKED_EXPERIMENTAL"
    reason: str = "No consented training dataset and validated model checkpoint are configured."


def train_dkt_lstm(consented_sequences: Sequence[Sequence[tuple[int, bool]]] | None, *, consent_verified: bool) -> DKTModelStatus:
    """Training boundary retained for a future approved ML pipeline."""
    if not consent_verified or not consented_sequences:
        return DKTModelStatus()
    try:
        import torch  # noqa: F401
    except ImportError:
        return DKTModelStatus(reason="PyTorch is not installed in this deployment.")
    return DKTModelStatus(reason="Training requires offline evaluation, model approval, and a signed checkpoint before activation.")


def evaluate_dkt_lstm(*_args, **_kwargs) -> DKTModelStatus:
    return DKTModelStatus()
