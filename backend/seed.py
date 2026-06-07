"""Popula o banco com dados iniciais para desenvolvimento.

Uso:
    python -m seed
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
        from sqlalchemy import select

        result = await session.execute(
            select(Lojista).where(Lojista.email == settings.superadmin_email)
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
            select(Lojista).where(Lojista.email == "lojista@aquario.com")
        )
        lojista = result.scalar_one_or_none()
        if not lojista:
            slug = await slug_unica(gerar_slug("Aquário do João"), session)
            lojista = Lojista(
                nome="Aquário do João",
                email="lojista@aquario.com",
                senha_hash=hash_senha("senha123"),
                slug=slug,
                whatsapp="11988888888",
                cor_primaria="#0077b6",
                instagram_url="https://www.instagram.com/aquario.do.joao",
                mercado_livre_url="https://www.mercadolivre.com.br/perfil/aquario-do-joao",
                plano="gratuito",
            )
            session.add(lojista)
            await session.flush()
            print(f"Lojista criado: lojista@aquario.com / senha123 (slug: {slug})")

            # Categorias e produtos de aquarismo
            categorias_produtos = {
                "Peixes Ornamentais": [
                    ("Betta Splendens", 39.90, "Popular"),
                    ("Guppy Trio", 24.90, None),
                    ("Acará Bandeira", 49.90, None),
                    ("Corydora Albina", 19.90, "Novo"),
                    ("Tetra Neon", 9.90, "Popular"),
                    ("Limpa Vidro (Otocinclus)", 14.90, None),
                ],
                "Aquários": [
                    ("Aquário 30L c/ Kit", 199.90, "Oferta"),
                    ("Aquário 60L c/ Filtro", 349.90, "Popular"),
                    ("Aquário 120L Stand", 799.90, None),
                    ("Mini Aquário 15L", 129.90, "Novo"),
                ],
                "Filtragem": [
                    ("Filtro Interno 300L/h", 89.90, None),
                    ("Filtro Hang-On 600L/h", 159.90, "Popular"),
                    ("Esponja Biológica Média", 24.90, None),
                    ("Mídia Cerâmica 1kg", 34.90, None),
                    ("Bomba Submersa 800L/h", 119.90, None),
                ],
                "Iluminação": [
                    ("LED RGB 60cm 12W", 149.90, "Novo"),
                    ("LED Plantas 45cm 10W", 129.90, "Popular"),
                    ("Lâmpada UV 9W", 69.90, None),
                    ("Timer Digital", 39.90, None),
                ],
                "Decoração": [
                    ("Substrato Marchas 5kg", 49.90, "Popular"),
                    ("Areia Preta 3kg", 29.90, None),
                    ("Tronco Natural M", 59.90, None),
                    ("Pedra Rio 1kg", 19.90, None),
                    ("Planta Artificial 30cm", 24.90, "Novo"),
                ],
                "Alimentação": [
                    ("Ração Betta 50ml", 19.90, None),
                    ("Ração Flocos Premium 100ml", 29.90, "Popular"),
                    ("Ração Grânulos 150ml", 34.90, None),
                    ("Comprimido Cascudo", 14.90, None),
                    ("Bloodworm Liofilizado 20ml", 24.90, "Novo"),
                ],
                "Manutenção": [
                    ("Kit Teste pH", 49.90, None),
                    ("Condicionador 100ml", 29.90, "Popular"),
                    ("Sifão Limpa Fundo", 39.90, None),
                    ("Cepilho Algas", 14.90, None),
                    ("Termostato 100W", 69.90, None),
                ],
            }

            for ordem_cat, (cat_nome, produtos) in enumerate(categorias_produtos.items()):
                cat = Categoria(nome=cat_nome, lojista_id=lojista.id, ordem=ordem_cat)
                session.add(cat)
                await session.flush()

                for ordem_prod, (nome_prod, preco, badge) in enumerate(produtos):
                    ativo = ordem_prod < len(produtos) // 2 or ordem_prod == 0
                    prod = Produto(
                        lojista_id=lojista.id,
                        categoria_id=cat.id,
                        nome=nome_prod,
                        preco=preco,
                        badge=badge,
                        ordem=ordem_prod,
                        ativo=ativo,
                    )
                    session.add(prod)

        await session.commit()
        print("Seed concluído!")


asyncio.run(seed())
