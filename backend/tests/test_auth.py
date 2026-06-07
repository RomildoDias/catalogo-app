import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    res = await client.post(
        "/auth/register",
        json={
            "nome": "Nova Loja",
            "email": "nova@loja.com",
            "whatsapp": "11988887777",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["lojista"]["nome"] == "Nova Loja"
    assert data["lojista"]["slug"] == "nova-loja"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {
        "nome": "Loja Um",
        "email": "dup@loja.com",
        "whatsapp": "11988887777",
    }
    await client.post("/auth/register", json=payload)
    res = await client.post("/auth/register", json=payload)
    assert res.status_code == 500  # unique constraint


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post(
        "/auth/register",
        json={
            "nome": "Loja Login",
            "email": "login@loja.com",
            "whatsapp": "11988887777",
        },
    )
    res = await client.post(
        "/auth/login",
        json={"email": "login@loja.com", "senha": "senha123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["lojista"]["email"] == "login@loja.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post(
        "/auth/register",
        json={
            "nome": "Loja WP",
            "email": "wp@loja.com",
            "whatsapp": "11988887777",
        },
    )
    res = await client.post(
        "/auth/login",
        json={"email": "wp@loja.com", "senha": "senha_errada"},
    )
    assert res.status_code == 401
    assert "incorretos" in res.json()["detail"]


@pytest.mark.asyncio
async def test_me(client: AsyncClient, token_lojista: str):
    res = await client.get(
        "/auth/me", headers={"Authorization": f"Bearer {token_lojista}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "teste@lojista.com"


@pytest.mark.asyncio
async def test_me_unauthorized(client: AsyncClient):
    res = await client.get("/auth/me")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_atualizar_perfil(client: AsyncClient, token_lojista: str):
    res = await client.put(
        "/auth/me",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Loja Editada", "cor_primaria": "#ff0000"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["nome"] == "Loja Editada"
    assert data["cor_primaria"] == "#ff0000"
