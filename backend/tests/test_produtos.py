import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_listar_produtos_vazio(client: AsyncClient, token_lojista: str):
    res = await client.get(
        "/produtos/", headers={"Authorization": f"Bearer {token_lojista}"}
    )
    assert res.status_code == 200
    assert res.json() == []


@pytest.mark.asyncio
async def test_criar_produto(client: AsyncClient, token_lojista: str):
    res = await client.post(
        "/produtos/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={
            "nome": "Ração Premium",
            "descricao": "Para cães adultos",
            "preco": 89.90,
            "badge": "Novo",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["nome"] == "Ração Premium"
    assert data["badge"] == "Novo"
    assert float(data["preco"]) == 89.90
    assert data["ativo"] is True


@pytest.mark.asyncio
async def test_atualizar_produto(client: AsyncClient, token_lojista: str):
    criado = await client.post(
        "/produtos/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Produto Antigo", "preco": 10.00},
    )
    prod_id = criado.json()["id"]
    res = await client.put(
        f"/produtos/{prod_id}",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Produto Novo", "preco": 20.00},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["nome"] == "Produto Novo"
    assert float(data["preco"]) == 20.00


@pytest.mark.asyncio
async def test_toggle_ativo(client: AsyncClient, token_lojista: str):
    criado = await client.post(
        "/produtos/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Test Ativo"},
    )
    prod_id = criado.json()["id"]
    assert criado.json()["ativo"] is True

    res = await client.patch(
        f"/produtos/{prod_id}/ativo",
        headers={"Authorization": f"Bearer {token_lojista}"},
    )
    assert res.json()["ativo"] is False

    res = await client.patch(
        f"/produtos/{prod_id}/ativo",
        headers={"Authorization": f"Bearer {token_lojista}"},
    )
    assert res.json()["ativo"] is True


@pytest.mark.asyncio
async def test_deletar_produto(client: AsyncClient, token_lojista: str):
    criado = await client.post(
        "/produtos/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Remover"},
    )
    prod_id = criado.json()["id"]
    res = await client.delete(
        f"/produtos/{prod_id}",
        headers={"Authorization": f"Bearer {token_lojista}"},
    )
    assert res.status_code == 204


@pytest.mark.asyncio
async def test_produto_com_categoria(client: AsyncClient, token_lojista: str):
    # Cria categoria
    cat = await client.post(
        "/categorias/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Rações"},
    )
    cat_id = cat.json()["id"]

    # Cria produto com categoria
    res = await client.post(
        "/produtos/",
        headers={"Authorization": f"Bearer {token_lojista}"},
        json={"nome": "Ração 15kg", "categoria_id": cat_id},
    )
    assert res.status_code == 201
    assert res.json()["categoria_id"] == cat_id
