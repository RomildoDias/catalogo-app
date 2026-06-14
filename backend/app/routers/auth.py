import base64

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.lojista import Lojista
from app.schemas.lojista import LojistaCreate, LojistaLogin, LojistaResponse, LojistaUpdate, SenhaAlterar, TokenResponse
from app.services.auth_service import autenticar, criar_lojista, criar_token, hash_senha, verificar_senha
from app.services.upload_service import validar_arquivo, MAX_SIZE

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(dados: LojistaCreate, session: AsyncSession = Depends(get_db)):
    try:
        lojista = await criar_lojista(dados, session)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado",
        )
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


@router.post("/me/logo", response_model=LojistaResponse)
async def upload_logo(
    arquivo: UploadFile,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    data, _ext = validar_arquivo(arquivo, arquivo.content_type, MAX_SIZE)
    b64 = base64.b64encode(data).decode()
    current_user.logo_url = f"data:{arquivo.content_type};base64,{b64}"
    await session.commit()
    await session.refresh(current_user)
    return LojistaResponse.model_validate(current_user)


@router.delete("/me/logo", response_model=LojistaResponse)
async def remover_logo(
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    current_user.logo_url = None
    await session.commit()
    await session.refresh(current_user)
    return LojistaResponse.model_validate(current_user)


@router.post("/alterar-senha", status_code=status.HTTP_200_OK)
async def alterar_senha(
    dados: SenhaAlterar,
    current_user: Lojista = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    if not verificar_senha(dados.senha_atual, current_user.senha_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Senha atual incorreta")
    current_user.senha_hash = hash_senha(dados.nova_senha)
    await session.commit()
    return {"detail": "Senha alterada com sucesso"}
