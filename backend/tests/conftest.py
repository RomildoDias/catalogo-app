import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app

# Usa SQLite em memória para testes (mais rápido que PostgreSQL)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_async_session = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    """Cria as tabelas antes de cada teste e limpa depois."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with test_async_session() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    async with test_async_session() as s:
        yield s


@pytest_asyncio.fixture
async def token_lojista(client: AsyncClient) -> str:
    """Registra um lojista e retorna o token JWT."""
    res = await client.post(
        "/auth/register",
        json={
            "nome": "Lojista Teste",
            "email": "teste@lojista.com",
            "whatsapp": "11988887777",
        },
    )
    data = res.json()
    return data["access_token"]


@pytest_asyncio.fixture
async def token_superadmin(client: AsyncClient, session: AsyncSession) -> str:
    """Cria superadmin e retorna token."""
    from app.models.lojista import Lojista
    from app.services.auth_service import criar_token, hash_senha

    lojista = Lojista(
        nome="Admin",
        email="admin@catalogo.app",
        senha_hash=hash_senha("admin123"),
        slug="admin",
        whatsapp="11999999999",
        plano="pro",
    )
    session.add(lojista)
    await session.commit()
    return criar_token(str(lojista.id), role="lojista")
