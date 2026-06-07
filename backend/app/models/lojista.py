import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Lojista(Base):
    __tablename__ = "lojistas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    whatsapp: Mapped[str] = mapped_column(String(20), nullable=False)
    cor_primaria: Mapped[str] = mapped_column(String(7), default="#2d7a52")
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    plano: Mapped[str] = mapped_column(String(20), default="gratuito")
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    categorias = relationship("Categoria", back_populates="lojista", cascade="all, delete-orphan")
    produtos = relationship("Produto", back_populates="lojista", cascade="all, delete-orphan")
    dominios = relationship("Dominio", back_populates="lojista", cascade="all, delete-orphan")
