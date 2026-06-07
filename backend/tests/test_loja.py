import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_loja_nao_encontrada(client: AsyncClient):
    res = await client.get("/loja/slug-inexistente")
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_loja_publica(client: AsyncClient):
    # Registrar lojista
    res = await client.post(
        "/auth/register",
        json={
            "nome": "Loja Pública",
            "email": "publica@test.com",
            "whatsapp": "11988887777",
            "senha": "minha-senha-123",
        },
    )
    token = res.json()["access_token"]
    slug = res.json()["lojista"]["slug"]

    # Criar categoria e produto
    cat = await client.post(
        "/categorias/",
        headers={"Authorization": f"Bearer {token}"},
        json={"nome": "Geral"},
    )
    cat_id = cat.json()["id"]

    await client.post(
        "/produtos/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nome": "Produto Ativo",
            "descricao": "Descrição legal",
            "preco": 49.90,
            "categoria_id": cat_id,
        },
    )

    await client.post(
        "/produtos/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nome": "Produto Inativo",
            "preco": 99.90,
            "categoria_id": cat_id,
        },
    )
    # Desativar o segundo
    prods = await client.get(
        "/produtos/", headers={"Authorization": f"Bearer {token}"}
    )
    inativo_id = prods.json()[1]["id"]
    await client.patch(
        f"/produtos/{inativo_id}/ativo",
        headers={"Authorization": f"Bearer {token}"},
    )

    # Acessar loja pública
    res = await client.get(f"/loja/{slug}")
    assert res.status_code == 200
    data = res.json()
    assert data["nome"] == "Loja Pública"
    assert data["slug"] == slug
    assert len(data["categorias"]) == 1
    assert len(data["produtos"]) == 1  # só o ativo
    assert data["produtos"][0]["nome"] == "Produto Ativo"
