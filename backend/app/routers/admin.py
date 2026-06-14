import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_superadmin
from app.models.lojista import Lojista
from app.schemas.lojista import AdminLojistaCreate, AdminPlanoUpdate
from app.services.auth_service import criar_lojista

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/lojistas", status_code=status.HTTP_201_CREATED)
async def criar_lojista_admin(
    dados: AdminLojistaCreate,
    current_user: Lojista = Depends(get_current_superadmin),
    session: AsyncSession = Depends(get_db),
):
    from sqlalchemy.exc import IntegrityError
    try:
        lojista = await criar_lojista(dados, session)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado",
        )
    if dados.plano != "gratuito":
        lojista.plano = dados.plano
        await session.commit()
    return {
        "id": str(lojista.id),
        "nome": lojista.nome,
        "email": lojista.email,
        "slug": lojista.slug,
        "whatsapp": lojista.whatsapp,
        "plano": lojista.plano,
        "ativo": lojista.ativo,
    }


@router.get("/lojistas")
async def listar_lojistas(
    current_user: Lojista = Depends(get_current_superadmin),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Lojista).order_by(Lojista.criado_em.desc())
    )
    lojistas = result.scalars().all()
    return [
        {
            "id": str(l.id),
            "nome": l.nome,
            "email": l.email,
            "slug": l.slug,
            "whatsapp": l.whatsapp,
            "plano": l.plano,
            "ativo": l.ativo,
            "criado_em": l.criado_em.isoformat(),
        }
        for l in lojistas
    ]


@router.patch("/lojistas/{id}/ativo")
async def toggle_ativo(
    id: str,
    current_user: Lojista = Depends(get_current_superadmin),
    session: AsyncSession = Depends(get_db),
):
    try:
        lojista_id = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="ID inválido")
    result = await session.execute(select(Lojista).where(Lojista.id == lojista_id))
    lojista = result.scalar_one_or_none()
    if not lojista:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lojista não encontrado")
    lojista.ativo = not lojista.ativo
    await session.commit()
    return {"id": id, "ativo": lojista.ativo}


@router.patch("/lojistas/{id}/plano")
async def alterar_plano(
    id: str,
    dados: AdminPlanoUpdate,
    current_user: Lojista = Depends(get_current_superadmin),
    session: AsyncSession = Depends(get_db),
):
    try:
        lojista_id = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="ID inválido")
    result = await session.execute(select(Lojista).where(Lojista.id == lojista_id))
    lojista = result.scalar_one_or_none()
    if not lojista:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lojista não encontrado")
    lojista.plano = dados.plano
    await session.commit()
    return {"id": id, "plano": lojista.plano}
