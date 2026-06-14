from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.lojista import Lojista
from app.models.categoria import Categoria
from app.models.produto import Produto

router = APIRouter(prefix="/loja", tags=["loja pública"])


@router.get("/{slug}")
async def dados_loja(slug: str, session: AsyncSession = Depends(get_db)):
    result = await session.execute(
        select(Lojista)
        .options(selectinload(Lojista.categorias), selectinload(Lojista.produtos))
        .where(Lojista.slug == slug, Lojista.ativo.is_(True))
    )
    lojista = result.scalar_one_or_none()
    if not lojista:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loja não encontrada")

    categorias = [
        {"id": str(c.id), "nome": c.nome, "ordem": c.ordem}
        for c in sorted(lojista.categorias, key=lambda x: x.ordem)
    ]

    produtos = [
        {
            "id": str(p.id),
            "categoria_id": str(p.categoria_id) if p.categoria_id else None,
            "nome": p.nome,
            "descricao": p.descricao,
            "preco": float(p.preco) if p.preco else None,
            "foto_url": p.foto_url,
            "badge": p.badge,
        }
        for p in sorted(lojista.produtos, key=lambda x: x.ordem)
        if p.ativo
    ]

    return {
        "nome": lojista.nome,
        "slug": lojista.slug,
        "whatsapp": lojista.whatsapp,
        "cor_primaria": lojista.cor_primaria,
        "logo_url": lojista.logo_url,
        "instagram_url": lojista.instagram_url,
        "mercado_livre_url": lojista.mercado_livre_url,
        "exibir_watermark": lojista.plano == "gratuito",
        "categorias": categorias,
        "produtos": produtos,
    }
