from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_superadmin
from app.models.lojista import Lojista
from app.schemas.lojista import LojistaCreate, LojistaResponse
from app.services.auth_service import criar_lojista

router = APIRouter(prefix="/lojistas", tags=["lojistas"])


@router.post("/", response_model=LojistaResponse, status_code=status.HTTP_201_CREATED)
async def criar_lojista_endpoint(
    dados: LojistaCreate,
    current_user: Lojista = Depends(get_current_superadmin),
    session: AsyncSession = Depends(get_db),
):
    try:
        lojista = await criar_lojista(dados, session)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado",
        )
    return LojistaResponse.model_validate(lojista)
