import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_listar_categorias_vazio(client: AsyncClient, token_lojista: str):
    res = await client.get(
        "/categorias/", headers={"Authorization": f"Bearer {token_lojista}"}
    )
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.asyncio
async def test_criar_categoria(client: AsyncClient, token_lojista: str):
    res = await client.post(
        "/categorias/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Rações"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["nome"] == "Rações"
    assert "id" in data


@pytest.mark.asyncio
async def test_criar_e_listar(client: AsyncClient, token_lojista: str):
    await client.post(
        "/categorias/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Brinquedos"},
    )
    res = await client.get(
        "/categorias/", headers={"Authorization": f"Bearer {token_lojista}"}
    )
    assert len(res.json()) == 1


@pytest.mark.asyncio
async def test_renomear_categoria(client: AsyncClient, token_lojista: str):
    criada = await client.post(
        "/categorias/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Antigo"},
    )
    cat_id = criada.json()["id"]
    res = await client.put(
        f"/categorias/{cat_id}",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Novo Nome"},
    )
    assert res.status_code == 200
    assert res.json()["nome"] == "Novo Nome"


@pytest.mark.asyncio
async def test_deletar_categoria(client: AsyncClient, token_lojista: str):
    criada = await client.post(
        "/categorias/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Remover"},
    )
    cat_id = criada.json()["id"]
    res = await client.delete(
        f"/categorias/{cat_id}",
        headers={"Authorization": f"Bearer {token_lojista}"},
    )
    assert res.status_code == 204


@pytest.mark.asyncio
async def test_categoria_nao_encontrada(client: AsyncClient, token_lojista: str):
    res = await client.put(
        "/categorias/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Nada"},
    )
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_multi_tenancy(client: AsyncClient):
    # Registrar dois lojistas
    res1 = await client.post(
        "/auth/register",
        json={"nome": "Loja A", "email": "a@test.com", "whatsapp": "111", "senha": "minha-senha-123"},
    )
    token_a = res1.json()["access_token"]

    res2 = await client.post(
        "/auth/register",
        json={"nome": "Loja B", "email": "b@test.com", "whatsapp": "222", "senha": "minha-senha-123"},
    )
    token_b = res2.json()["access_token"]

    # Loja A cria categoria
    await client.post(
        "/categorias/",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"nome": "Categoria A"},
    )

    # Loja B vê lista vazia
    res = await client.get(
        "/categorias/", headers={"Authorization": f"Bearer {token_b}"}
    )
    assert len(res.json()) == 0
