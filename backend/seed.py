"""Popula o banco com dados iniciais para desenvolvimento.

Uso:
    python -m backend.seed

Ou via Docker:
    docker-compose exec backend python -m backend.seed
"""

import asyncio

from app.config import settings
from app.database import async_session, engine, Base
from app.models import Lojista, Categoria, Produto
from app.services.auth_service import hash_senha
from app.services.slug_service import gerar_slug, slug_unica


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Superadmin
        result = await session.execute(
            __import__("sqlalchemy").select(Lojista).where(Lojista.email == settings.superadmin_email)
        )
        if not result.scalar_one_or_none():
            lojista = Lojista(
                nome="Administrador",
                email=settings.superadmin_email,
                senha_hash=hash_senha(settings.superadmin_password),
                slug="admin",
                whatsapp="11999999999",
                plano="pro",
            )
            session.add(lojista)
            print(f"Superadmin criado: {settings.superadmin_email} / {settings.superadmin_password}")

        # Lojista exemplo
        result = await session.execute(
            __import__("sqlalchemy").select(Lojista).where(Lojista.email == "lojista@teste.com")
        )
        lojista = result.scalar_one_or_none()
        if not lojista:
            slug = await slug_unica(gerar_slug("Pet Shop do João"), session)
            lojista = Lojista(
                nome="Pet Shop do João",
                email="lojista@teste.com",
                senha_hash=hash_senha("senha123"),
                slug=slug,
                whatsapp="11988888888",
                cor_primaria="#2d7a52",
                plano="gratuito",
            )
            session.add(lojista)
            await session.flush()
            print(f"Lojista criado: lojista@teste.com / senha123 (slug: {slug})")

            # Categorias
            cats = ["Rações", "Brinquedos", "Higiene", "Acessórios"]
            for i, nome in enumerate(cats):
                cat = Categoria(nome=nome, lojista_id=lojista.id, ordem=i)
                session.add(cat)
                await session.flush()

                # Produtos
                produtos = [
                    ("Ração Premium Cães 15kg", 159.90, "Oferta"),
                    ("Ração Gatos Adultos 7kg", 89.90, "Popular"),
                    ("Osso Natural Pet", 19.90, None),
                    ("Shampoo Neutro 500ml", 34.90, "Novo"),
                    ("Coleira Ajustável", 29.90, None),
                ]
                for j, (nome_prod, preco, badge) in enumerate(produtos[: i + 2]):
                    prod = Produto(
                        lojista_id=lojista.id,
                        categoria_id=cat.id,
                        nome=nome_prod,
                        preco=preco,
                        badge=badge,
                        ordem=j,
                    )
                    session.add(prod)

        await session.commit()
        print("Seed concluído!")


asyncio.run(seed())
