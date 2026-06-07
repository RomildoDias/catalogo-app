import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.lojista import Lojista
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoResponse, ProdutoUpdate

router = APIRouter(prefix="/produtos", tags=["produtos"])


async def _get_produto(id: str, lojista_id: uuid.UUID, session: AsyncSession) -> Produto:
    try:
        prod_id = uuid.UUID(id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="ID inválido")
    result = await session.execute(
        select(Produto).where(Produto.id == prod_id, Produto.lojista_id == lojista_id)
    )
    prod = result.scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    return prod


def _parse_categoria_id(categoria_id: str | None) -> uuid.UUID | None:
    if categoria_id:
        try:
            return uuid.UUID(categoria_id)
        except ValueError:
            pass
    return None


@router.get("/", response_model=list[ProdutoResponse])
async def listar(
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Produto)
        .where(Produto.lojista_id == current_user.id)
        .order_by(Produto.ordem)
    )
    return result.scalars().all()


@router.post("/", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
async def criar(
    dados: ProdutoCreate,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    # Verificar limite de produtos ativos no plano gratuito
    if current_user.plano == "gratuito" and dados.ativo is not False:
        result = await session.execute(
            select(Produto).where(
                Produto.lojista_id == current_user.id, Produto.ativo.is_(True)
            )
        )
        produtos_ativos = len(result.scalars().all())
        if produtos_ativos >= 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Plano gratuito permite até 20 produtos ativos",
            )
    produto = Produto(
        lojista_id=current_user.id,
        categoria_id=_parse_categoria_id(dados.categoria_id),
        nome=dados.nome,
        descricao=dados.descricao,
        preco=dados.preco,
        badge=dados.badge,
    )
    session.add(produto)
    await session.commit()
    await session.refresh(produto)
    return ProdutoResponse.model_validate(produto)


@router.put("/{id}", response_model=ProdutoResponse)
async def atualizar(
    id: str,
    dados: ProdutoUpdate,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    produto = await _get_produto(id, current_user.id, session)
    update_data = dados.model_dump(exclude_unset=True)
    if "categoria_id" in update_data:
        update_data["categoria_id"] = _parse_categoria_id(dados.categoria_id)
    for key, value in update_data.items():
        setattr(produto, key, value)
    await session.commit()
    await session.refresh(produto)
    return ProdutoResponse.model_validate(produto)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar(
    id: str,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    produto = await _get_produto(id, current_user.id, session)
    await session.delete(produto)
    await session.commit()


@router.patch("/{id}/ativo", response_model=ProdutoResponse)
async def toggle_ativo(
    id: str,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    produto = await _get_produto(id, current_user.id, session)
    # Verificar limite se for ativar e estiver no gratuito
    if not produto.ativo and current_user.plano == "gratuito":
        result = await session.execute(
            select(Produto).where(
                Produto.lojista_id == current_user.id, Produto.ativo.is_(True)
            )
        )
        if len(result.scalars().all()) >= 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Plano gratuito permite até 20 produtos ativos",
            )
    produto.ativo = not produto.ativo
    await session.commit()
    await session.refresh(produto)
    return ProdutoResponse.model_validate(produto)
