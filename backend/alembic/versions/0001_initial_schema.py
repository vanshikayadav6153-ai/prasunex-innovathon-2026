"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-11-12 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use metadata from Base to create all tables cleanly
    from app.database import Base
    from app import models
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    from app.database import Base
    from app import models
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
