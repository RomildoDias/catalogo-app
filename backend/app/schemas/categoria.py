import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class CategoriaCreate(BaseModel):
    nome: str = Field(..., max_length=80)


class CategoriaUpdate(BaseModel):
    nome: str = Field(..., max_length=80)


class CategoriaResponse(BaseModel):
    id: uuid.UUID
    lojista_id: uuid.UUID
    nome: str
    ordem: int
    criado_em: datetime

    model_config = {"from_attributes": True}


class OrdemUpdate(BaseModel):
    itens: list[dict]  # [{"id": "uuid", "ordem": 0}]
