import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Dominio(Base):
    __tablename__ = "dominios"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    lojista_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lojistas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    dominio: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    verificado: Mapped[bool] = mapped_column(Boolean, default=False)
    token_txt: Mapped[str | None] = mapped_column(String(64), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    lojista = relationship("Lojista", back_populates="dominios")
