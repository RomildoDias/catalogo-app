import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.categoria import Categoria
from app.models.lojista import Lojista
from app.schemas.categoria import CategoriaCreate, CategoriaResponse, CategoriaUpdate, OrdemUpdate

router = APIRouter(prefix="/categorias", tags=["categorias"])


async def _get_categoria(id: str, lojista_id: uuid.UUID, session: AsyncSession) -> Categoria:
    try:
        cat_id = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="ID inválido")
    result = await session.execute(
        select(Categoria).where(Categoria.id == cat_id, Categoria.lojista_id == lojista_id)
    )
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria não encontrada")
    return cat


@router.get("/", response_model=list[CategoriaResponse])
async def listar(
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Categoria)
        .where(Categoria.lojista_id == current_user.id)
        .order_by(Categoria.ordem)
    )
    return result.scalars().all()


@router.post("/", response_model=CategoriaResponse, status_code=status.HTTP_201_CREATED)
async def criar(
    dados: CategoriaCreate,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    # Verificar limite de categorias no plano gratuito
    if current_user.plano == "gratuito":
        result = await session.execute(
            select(Categoria).where(Categoria.lojista_id == current_user.id)
        )
        if len(result.scalars().all()) >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Plano gratuito permite até 5 categorias",
            )
    categoria = Categoria(nome=dados.nome, lojista_id=current_user.id)
    session.add(categoria)
    await session.commit()
    await session.refresh(categoria)
    return CategoriaResponse.model_validate(categoria)


@router.put("/{id}", response_model=CategoriaResponse)
async def atualizar(
    id: str,
    dados: CategoriaUpdate,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    categoria = await _get_categoria(id, current_user.id, session)
    categoria.nome = dados.nome
    await session.commit()
    await session.refresh(categoria)
    return CategoriaResponse.model_validate(categoria)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar(
    id: str,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    categoria = await _get_categoria(id, current_user.id, session)
    await session.delete(categoria)
    await session.commit()


@router.patch("/ordem", status_code=status.HTTP_200_OK)
async def reordenar(
    dados: OrdemUpdate,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    for item in dados.itens:
        try:
            cat_id = uuid.UUID(item.id)
        except (ValueError, KeyError):
            continue
        await session.execute(
            update(Categoria)
            .where(Categoria.id == cat_id, Categoria.lojista_id == current_user.id)
            .values(ordem=item.ordem)
        )
    await session.commit()
    return {"detail": "Ordem atualizada"}
