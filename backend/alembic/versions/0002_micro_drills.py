"""Add teacher reviewed micro drill content and review history tables.

Revision ID: 0002_micro_drills
Revises: 0001_initial_schema
"""
from typing import Sequence, Union

from alembic import op

revision: str = "0002_micro_drills"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # create_all is additive here: the migration adds the new drill tables and
    # leaves the existing ReviewCard table intact.
    from app.database import Base
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    from app.models import DrillQuestionReview, ReviewAttempt, ReviewEvent, ReviewReminderJob

    bind = op.get_bind()
    for table in (ReviewReminderJob.__table__, ReviewEvent.__table__, ReviewAttempt.__table__, DrillQuestionReview.__table__):
        table.drop(bind=bind, checkfirst=True)
