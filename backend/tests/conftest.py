import asyncio
import os
import tempfile
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app

_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
DB_PATH = _db_file.name
_db_file.close()

TEST_DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

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
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


def cleanup():
    if os.path.exists(DB_PATH):
        try:
            os.unlink(DB_PATH)
        except PermissionError:
            pass


@pytest.fixture(scope="session", autouse=True)
async def _cleanup():
    yield
    await test_engine.dispose()
    cleanup()


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with test_async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
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
    res = await client.post(
        "/auth/register",
        json={
            "nome": "Lojista Teste",
            "email": "teste@lojista.com",
            "whatsapp": "11988887777",
            "senha": "minha-senha-123",
        },
    )
    return res.json()["access_token"]


@pytest_asyncio.fixture
async def token_superadmin(client: AsyncClient, session: AsyncSession) -> str:
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
    return criar_token(str(lojista.id), role="admin")
