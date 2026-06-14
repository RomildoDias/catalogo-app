import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class ProdutoCreate(BaseModel):
    categoria_id: str | None = None
    nome: str = Field(..., min_length=1, max_length=120)
    descricao: str | None = None
    preco: Decimal | None = Field(None, ge=0)
    badge: str | None = Field(None, max_length=30)


class ProdutoUpdate(BaseModel):
    categoria_id: str | None = None
    nome: str | None = Field(None, min_length=1, max_length=120)
    descricao: str | None = None
    preco: Decimal | None = Field(None, ge=0)
    badge: str | None = Field(None, max_length=30)
    ativo: bool | None = None


class ProdutoResponse(BaseModel):
    id: uuid.UUID
    lojista_id: uuid.UUID
    categoria_id: uuid.UUID | None
    nome: str
    descricao: str | None
    preco: Decimal | None
    foto_url: str | None
    badge: str | None
    ativo: bool
    ordem: int
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}
