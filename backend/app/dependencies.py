import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.lojista import Lojista
from app.services.auth_service import decodificar_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db),
) -> Lojista:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acesso obrigatório",
        )
    payload = decodificar_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        )
    lojista_id = payload.get("sub")
    if not lojista_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )
    result = await session.execute(
        select(Lojista).where(Lojista.id == uuid.UUID(lojista_id))
    )
    lojista = result.scalar_one_or_none()
    if not lojista or not lojista.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Lojista não encontrado ou inativo",
        )
    return lojista


async def get_current_superadmin(
    current_user: Lojista = Depends(get_current_user),
) -> Lojista:
    from app.config import settings
    if current_user.email != settings.superadmin_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return current_user
