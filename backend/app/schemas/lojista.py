import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LojistaCreate(BaseModel):
    nome: str = Field(..., max_length=120)
    email: EmailStr
    whatsapp: str = Field(..., max_length=20)


class LojistaLogin(BaseModel):
    email: EmailStr
    senha: str


class LojistaResponse(BaseModel):
    id: uuid.UUID
    nome: str
    email: str
    slug: str
    whatsapp: str
    cor_primaria: str
    logo_url: str | None
    plano: str
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    lojista: LojistaResponse
