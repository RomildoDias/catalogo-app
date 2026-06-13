import asyncio
import re

from app.config import settings
from app.database import async_session, engine, Base
from app.models import Lojista, Categoria, Produto
from app.services.auth_service import hash_senha
from app.services.slug_service import gerar_slug, slug_unica


def img_seed(nome):
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", nome).lower().strip("-")
    return f"https://picsum.photos/seed/{slug}/400/400"


categorias_produtos = {
    "Peixes Ornamentais": [
        (
            "Betta Splendens",
            39.90,
            "Popular",
            "Peixe betta macho de cor azul intensa. Fácil de manter em aquários pequenos, perfeito para iniciantes. Acompanha condicionador de água.",
            "https://images.unsplash.com/photo-1520366498724-709889c0c685?w=400&h=400&fit=crop",
        ),
        (
            "Guppy Trio",
            24.90,
            None,
            "Kit com 3 guppys (2 fêmeas, 1 macho) de linhagem selecionada. Cores vibrantes e reprodução fácil. Tamanho médio: 4cm.",
            "https://images.unsplash.com/photo-1570453904318-53f64b19d81a?w=400&h=400&fit=crop",
        ),
        (
            "Acará Bandeira",
            49.90,
            None,
            "Peixe de porte médio com nadadeiras elegantes. Ideal para aquários comunitários. Tamanho adulto: 12cm.",
            "https://images.unsplash.com/photo-1586282015467-3a36c43d8a57?w=400&h=400&fit=crop",
        ),
        (
            "Corydora Albina",
            19.90,
            "Novo",
            "Limpa-fundo pacífico e sociável. Vive em cardumes de 3+ exemplares. Coloração albina rara. Tamanho: 5cm.",
            "https://images.unsplash.com/photo-1545340534-32e99207577e?w=400&h=400&fit=crop",
        ),
        (
            "Tetra Neon",
            9.90,
            "Popular",
            "Cardume clássico de água doce. Faixa azul neon que brilha sob iluminação LED. Tamanho: 3cm. Lote com 5 unidades.",
            "https://images.unsplash.com/photo-1510318418409-62a1eb9d1d74?w=400&h=400&fit=crop",
        ),
        (
            "Limpa Vidro (Otocinclus)",
            14.90,
            None,
            "Pequeno bagre comedor de algas. Essencial para manter o aquário limpo. Tamanho máximo: 4cm.",
            "https://images.unsplash.com/photo-1600393793741-f7d89e7f19f6?w=400&h=400&fit=crop",
        ),
    ],
    "Aquários": [
        (
            "Aquário 30L c/ Kit",
            199.90,
            "Oferta",
            "Kit completo para iniciar: aquário 30L, filtro interno, termostato 50W, tampa com LED e ração inicial. Dimensões: 40x25x30cm.",
            "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=400&fit=crop",
        ),
        (
            "Aquário 60L c/ Filtro",
            349.90,
            "Popular",
            "Aquário 60L em vidro 6mm com filtro hang-on 600L/h, tampa articulada e iluminação LED branca. Dimensões: 60x30x35cm.",
            "https://images.unsplash.com/photo-1585945369050-6fe5c6d28b29?w=400&h=400&fit=crop",
        ),
        (
            "Aquário 120L Stand",
            799.90,
            None,
            "Aquário panorâmico 120L em vidro 8mm com móvel stand em MDP preto, filtro canister 1200L/h e LED RGB. Dimensões: 80x35x45cm.",
            "https://images.unsplash.com/photo-1551887373-3c5bd224f6e2?w=400&h=400&fit=crop",
        ),
        (
            "Mini Aquário 15L",
            129.90,
            "Novo",
            "Aquário compacto 15L ideal para bettas ou camarões. Filtro interno silencioso, LED azul/branco e tampa. Dimensões: 25x20x30cm.",
            "https://images.unsplash.com/photo-1512127353238-e1fa6a9ffbb9?w=400&h=400&fit=crop",
        ),
    ],
    "Filtragem": [
        (
            "Filtro Interno 300L/h",
            89.90,
            None,
            "Filtro interno submerso com vazão ajustável de até 300L/h. Mídias inclusas: esponja, carvão ativado e cerâmica. Ideal para aquários até 40L.",
            "https://images.unsplash.com/photo-1620327467532-6ebaca6273ed?w=400&h=400&fit=crop",
        ),
        (
            "Filtro Hang-On 600L/h",
            159.90,
            "Popular",
            "Filtro externo hang-on com vazão 600L/h. Triplo estágio de filtragem: mecânica, química e biológica. Para aquários até 80L.",
            "https://images.unsplash.com/photo-1585351930947-ee1ffbbcacde?w=400&h=400&fit=crop",
        ),
        (
            "Esponja Biológica Média",
            24.90,
            None,
            "Esponja de porosidade média para filtragem mecânica e biológica. Dimensões: 10x10x5cm. Pode ser lavada e reutilizada.",
            None,
        ),
        (
            "Mídia Cerâmica 1kg",
            34.90,
            None,
            "Anéis de cerâmica porosa para filtragem biológica. Alta área superficial para colonização de bactérias nitrificantes. Pacote 1kg.",
            None,
        ),
        (
            "Bomba Submersa 800L/h",
            119.90,
            None,
            "Bomba d'água submersa de alta eficiência. Vazão: 800L/h, consumo: 12W. Silenciosa e com base antirruído. Para aquários até 200L.",
            "https://images.unsplash.com/photo-1593197953817-1c8a49c5b84b?w=400&h=400&fit=crop",
        ),
    ],
    "Iluminação": [
        (
            "LED RGB 60cm 12W",
            149.90,
            "Novo",
            "Fita LED RGB com controle remoto para aquários de até 60cm de comprimento. 12W, 24 LEDs, efeitos sunset, tempestade e lua. IP65.",
            "https://images.unsplash.com/photo-1569474039636-25b8f4880639?w=400&h=400&fit=crop",
        ),
        (
            "LED Plantas 45cm 10W",
            129.90,
            "Popular",
            "Luminária LED full spectrum para crescimento de plantas aquáticas. 10W, espectro 6500K + vermelho 660nm. Braços ajustáveis.",
            "https://images.unsplash.com/photo-1667504032561-23b01b49e2aa?w=400&h=400&fit=crop",
        ),
        (
            'Lâmpada UV 9W',
            69.90,
            None,
            "Lâmpada esterilizadora UV-C 9W para eliminar algas flutuantes e bactérias. Compatível com filtros canister. Rosca E27.",
            None,
        ),
        (
            "Timer Digital",
            39.90,
            None,
            "Timer digital programável com 10 ciclos liga/desliga. Display LCD, bateria interna para salvar programação. 10A / 2200W.",
            "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
        ),
    ],
    "Decoração": [
        (
            "Substrato Marchas 5kg",
            49.90,
            "Popular",
            "Substrato fértil para plantas aquáticas. Rico em ferro e micronutrientes. Grãos de 2-4mm. Não altera pH da água. Pacote 5kg.",
            "https://images.unsplash.com/photo-1599571234902-5d90c3e6098f?w=400&h=400&fit=crop",
        ),
        (
            "Areia Preta 3kg",
            29.90,
            None,
            "Areia quartzítica preta granulometria fina (1-2mm). Realça as cores dos peixes. Pacote 3kg cobre até 30L.",
            None,
        ),
        (
            "Tronco Natural M",
            59.90,
            None,
            "Tronco natural de madeira apta para aquário. Libera tanino que acidifica suavemente a água. Tamanho médio (20-30cm). Acompanha peso de chumbo.",
            "https://images.unsplash.com/photo-1548814817-23e29dc420f5?w=400&h=400&fit=crop",
        ),
        (
            "Pedra Rio 1kg",
            19.90,
            None,
            "Seleção de pedras de rio polidas em tamanhos variados (3-8cm). Inertes, não alteram parâmetros da água. 1kg (~8-12 pedras).",
            None,
        ),
        (
            "Planta Artificial 30cm",
            24.90,
            "Novo",
            "Planta artificial de seda com haste plástica. Base de cerâmica para fixação. 30cm de altura. Aspecto natural e sem manutenção.",
            "https://images.unsplash.com/photo-1533779183510-8cc0de8e60e6?w=400&h=400&fit=crop",
        ),
    ],
    "Alimentação": [
        (
            "Ração Betta 50ml",
            19.90,
            None,
            "Ração em pellets flutuantes especialmente formulada para Bettas. Alto teor de proteína (45%). Contém astaxantina para realçar cores.",
            "https://images.unsplash.com/photo-1565708096664-68d297f5df36?w=400&h=400&fit=crop",
        ),
        (
            "Ração Flocos Premium 100ml",
            29.90,
            "Popular",
            "Ração em flocos premium para peixes ornamentais tropicais. 42% de proteína, enriquecida com vitaminas A, D3, E e C. 100ml.",
            "https://images.unsplash.com/photo-1604053135307-d7b1c3c07e8b?w=400&h=400&fit=crop",
        ),
        (
            "Ração Grânulos 150ml",
            34.90,
            None,
            "Ração em grânulos médios para peixes de médio porte. Afunda lentamente para alimentar todos os níveis. 150ml.",
            None,
        ),
        (
            "Comprimido Cascudo",
            14.90,
            None,
            "Pastilhas de fundo para cascudos e peixes bentônicos. À base de spirulina e vegetais. 10 comprimidos. Afundam rapidamente.",
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        ),
        (
            "Bloodworm Liofilizado 20ml",
            24.90,
            "Novo",
            "Bloodworm (larva de mosquito) liofilizada. Petisco rico em proteína para todos os peixes. Estimula o instinto de caça. 20ml.",
            None,
        ),
    ],
    "Manutenção": [
        (
            "Kit Teste pH",
            49.90,
            None,
            "Kit completo para medição de pH da água. Teste líquido com escala de 5.0 a 9.0. Inclui frasco reagente, tubo comparador e tabela.",
            "https://images.unsplash.com/photo-1634097757366-726f9f1f0371?w=400&h=400&fit=crop",
        ),
        (
            "Condicionador 100ml",
            29.90,
            "Popular",
            "Condicionador de água que neutraliza cloro, cloraminas e metais pesados. Adiciona aloe vera para proteção da camada de muco. 100ml.",
            "https://images.unsplash.com/photo-1598392019988-21d256f7510f?w=400&h=400&fit=crop",
        ),
        (
            "Sifão Limpa Fundo",
            39.90,
            None,
            "Sifão manual para limpeza de fundo com bulb. Mangueira transparente de 1.5m. Válvula que controla a vazão.",
            "https://images.unsplash.com/photo-1636622433525-127afdf3662d?w=400&h=400&fit=crop",
        ),
        (
            "Cepilho Algas",
            14.90,
            None,
            "Cepilho magnético para limpeza de vidro. Ímã dupla-face com lâmina raspadora. Para vidros de até 8mm de espessura.",
            None,
        ),
        (
            "Termostato 100W",
            69.90,
            None,
            "Termostato automático 100W com controle digital. Ajuste de 18°C a 34°C. Display LED, desligamento automático. Para aquários até 60L.",
            "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=400&fit=crop",
        ),
    ],
}


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        from sqlalchemy import select

        # Superadmin
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
            print(f'Lojista criado: lojista@aquario.com / senha123 (slug: {slug})')

            for ordem_cat, (cat_nome, produtos) in enumerate(categorias_produtos.items()):
                cat = Categoria(nome=cat_nome, lojista_id=lojista.id, ordem=ordem_cat)
                session.add(cat)
                await session.flush()

                for ordem_prod, (nome_prod, preco, badge, descricao, foto_url) in enumerate(produtos):
                    prod = Produto(
                        lojista_id=lojista.id,
                        categoria_id=cat.id,
                        nome=nome_prod,
                        descricao=descricao,
                        preco=preco,
                        badge=badge,
                        foto_url=foto_url or img_seed(nome_prod),
                        ordem=ordem_prod,
                        ativo=True,
                    )
                    session.add(prod)

        await session.commit()
        print("Seed concluído!")


asyncio.run(seed())
