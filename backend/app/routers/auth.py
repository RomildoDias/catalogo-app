from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.lojista import Lojista
from app.schemas.lojista import LojistaCreate, LojistaLogin, LojistaResponse, LojistaUpdate, TokenResponse
from app.services.auth_service import autenticar, criar_lojista, criar_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(dados: LojistaCreate, session: AsyncSession = Depends(get_db)):
    lojista = await criar_lojista(dados, session)
    token = criar_token(str(lojista.id))
    return TokenResponse(access_token=token, lojista=LojistaResponse.model_validate(lojista))


@router.post("/login", response_model=TokenResponse)
async def login(dados: LojistaLogin, session: AsyncSession = Depends(get_db)):
    lojista = await autenticar(dados.email, dados.senha, session)
    if not lojista:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )
    token = criar_token(str(lojista.id))
    return TokenResponse(access_token=token, lojista=LojistaResponse.model_validate(lojista))


@router.get("/me", response_model=LojistaResponse)
async def me(current_user: Lojista = Depends(get_current_user)):
    return LojistaResponse.model_validate(current_user)


@router.put("/me", response_model=LojistaResponse)
async def atualizar_perfil(
    dados: LojistaUpdate,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    update_data = dados.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    await session.commit()
    await session.refresh(current_user)
    return LojistaResponse.model_validate(current_user)
