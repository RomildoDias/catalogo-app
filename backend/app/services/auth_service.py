import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.lojista import Lojista
from app.schemas.lojista import LojistaCreate
from app.services.slug_service import gerar_slug, slug_unica

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha, senha_hash)


def criar_token(lojista_id: str, role: str = "lojista") -> str:
    payload = {
        "sub": lojista_id,
        "role": role,
        "exp": datetime.now(timezone.utc)
        + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decodificar_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None


async def criar_lojista(dados: LojistaCreate, session: AsyncSession) -> Lojista:
    slug_base = gerar_slug(dados.nome)
    slug = await slug_unica(slug_base, session)

    # Senha padrão para primeiro acesso
    senha_hash = hash_senha("senha123")

    lojista = Lojista(
        nome=dados.nome,
        email=dados.email,
        senha_hash=senha_hash,
        slug=slug,
        whatsapp=dados.whatsapp,
    )
    session.add(lojista)
    await session.commit()
    await session.refresh(lojista)
    return lojista


async def autenticar(email: str, senha: str, session: AsyncSession) -> Lojista | None:
    result = await session.execute(select(Lojista).where(Lojista.email == email))
    lojista = result.scalar_one_or_none()
    if not lojista or not verificar_senha(senha, lojista.senha_hash):
        return None
    return lojista
