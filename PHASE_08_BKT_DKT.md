# Phase 08 — M01 BKT-first mastery analytics

The production model is deterministic Bayesian Knowledge Tracing. It uses the
fixed source baseline: `P(L0)=0.30`, learning/transition `T=0.15`, guess
`G=0.20`, and slip `S=0.10`.

For a correct response:

`P(L|correct) = P(L)(1-S) / [P(L)(1-S) + (1-P(L))G]`

For a wrong response:

`P(L|wrong) = P(L)S / [P(L)S + (1-P(L))(1-G)]`

After an observed response: `P(L_next) = P(L|obs) + (1-P(L|obs))T`.
Missing answers produce no update. Each observed response is appended to the
tenant-scoped `concept_attempts` stream. The API shows no-data/low-sample
warnings below 3 attempts and a medium-confidence warning below 8 attempts.

`GET /api/v1/analytics/dkt/{student_id}?course_id=...` enforces a student’s
self-only access and tenant containment. It returns concept probabilities,
attempt history, directed edges, cycle-validated prerequisites, and earliest
weak upstream blockers. `POST /api/v1/analytics/dkt/attempts` records an
observed answer and applies the deterministic update.

The PyTorch LSTM DKT interface is explicitly `BLOCKED_EXPERIMENTAL`: without a
consented dataset, evaluation, and approved checkpoint, no trained-DKT claim or
prediction is served.
