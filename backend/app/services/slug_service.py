import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lojista import Lojista


def gerar_slug(nome: str) -> str:
    slug = nome.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug or "loja"


async def slug_unica(slug_base: str, session: AsyncSession) -> str:
    slug = slug_base
    sufixo = 0
    while True:
        result = await session.execute(select(Lojista).where(Lojista.slug == slug))
        if not result.scalar_one_or_none():
            return slug
        sufixo += 1
        slug = f"{slug_base}-{sufixo}"
