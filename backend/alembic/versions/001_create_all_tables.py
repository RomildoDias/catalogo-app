"""create all tables

Revision ID: 001
Revises:
Create Date: 2026-06-06 21:20:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "lojistas",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("nome", sa.String(120), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("senha_hash", sa.Text(), nullable=False),
        sa.Column("slug", sa.String(80), unique=True, nullable=False),
        sa.Column("whatsapp", sa.String(20), nullable=False),
        sa.Column("cor_primaria", sa.String(7), server_default="#2d7a52"),
        sa.Column("logo_url", sa.Text(), nullable=True),
        sa.Column("plano", sa.String(20), server_default="gratuito"),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "categorias",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("lojista_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lojistas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("nome", sa.String(80), nullable=False),
        sa.Column("ordem", sa.Integer(), server_default=sa.text("0")),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "produtos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("lojista_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lojistas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("categoria_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categorias.id", ondelete="SET NULL"), nullable=True),
        sa.Column("nome", sa.String(120), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("preco", sa.Numeric(10, 2), nullable=True),
        sa.Column("foto_url", sa.Text(), nullable=True),
        sa.Column("badge", sa.String(30), nullable=True),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("ordem", sa.Integer(), server_default=sa.text("0")),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "dominios",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("lojista_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lojistas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dominio", sa.String(255), unique=True, nullable=False),
        sa.Column("verificado", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("token_txt", sa.String(64), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("dominios")
    op.drop_table("produtos")
    op.drop_table("categorias")
    op.drop_table("lojistas")
