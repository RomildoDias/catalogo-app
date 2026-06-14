"""add instagram_url and mercado_livre_url to lojistas

Revision ID: 002
Revises: 001
Create Date: 2026-06-13 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("lojistas", sa.Column("instagram_url", sa.Text(), nullable=True))
    op.add_column("lojistas", sa.Column("mercado_livre_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("lojistas", "mercado_livre_url")
    op.drop_column("lojistas", "instagram_url")
