import uuid
from datetime import datetime

from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class LojistaCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    whatsapp: str = Field(..., max_length=20)
    senha: str = Field(..., min_length=8, max_length=128)


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
    instagram_url: str | None = None
    mercado_livre_url: str | None = None
    plano: str
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime

    model_config = {"from_attributes": True}


class AdminLojistaCreate(LojistaCreate):
    plano: Literal["gratuito", "pro"] = "gratuito"


class AdminPlanoUpdate(BaseModel):
    plano: Literal["gratuito", "pro"] = "gratuito"


class LojistaUpdate(BaseModel):
    nome: str | None = Field(None, min_length=1, max_length=120)
    whatsapp: str | None = Field(None, max_length=20)
    cor_primaria: str | None = Field(None, max_length=7, pattern=r"^#[0-9a-fA-F]{6}$")
    logo_url: str | None = None
    instagram_url: str | None = None
    mercado_livre_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    lojista: LojistaResponse


class SenhaAlterar(BaseModel):
    senha_atual: str
    nova_senha: str = Field(..., min_length=8, max_length=128)
