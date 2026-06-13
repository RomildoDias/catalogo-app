"""Atualiza produtos existentes com descrições e imagens.

Uso:
    cd backend && python -m scripts.atualizar_produtos
"""

import asyncio
import re
import sys
from pathlib import Path

# Adiciona o diretório backend ao path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import async_session
from app.models import Produto
from app.services.slug_service import gerar_slug
from sqlalchemy import select


def img_seed(nome):
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", nome).lower().strip("-")
    return f"https://picsum.photos/seed/{slug}/400/400"


descricoes = {
    "Betta Splendens": "Peixe betta macho de cor azul intensa. Fácil de manter em aquários pequenos, perfeito para iniciantes.",
    "Guppy Trio": "Kit com 3 guppys (2 fêmeas, 1 macho) de linhagem selecionada. Cores vibrantes e reprodução fácil.",
    "Acará Bandeira": "Peixe de porte médio com nadadeiras elegantes. Ideal para aquários comunitários. Tamanho adulto: 12cm.",
    "Corydora Albina": "Limpa-fundo pacífico e sociável. Vive em cardumes. Coloração albina rara.",
    "Tetra Neon": "Cardume clássico de água doce. Faixa azul neon que brilha sob iluminação LED.",
    "Limpa Vidro (Otocinclus)": "Pequeno bagre comedor de algas. Essencial para manter o aquário limpo.",
    "Aquário 30L c/ Kit": "Kit completo para iniciar: aquário 30L, filtro interno, termostato 50W e LED.",
    "Aquário 60L c/ Filtro": "Aquário 60L em vidro 6mm com filtro hang-on 600L/h e LED.",
    "Aquário 120L Stand": "Aquário panorâmico 120L com móvel stand em MDP, filtro canister e LED RGB.",
    "Mini Aquário 15L": "Aquário compacto 15L ideal para bettas ou camarões. Filtro e LED inclusos.",
    "Filtro Interno 300L/h": "Filtro interno submerso com vazão ajustável. Mídias inclusas.",
    "Filtro Hang-On 600L/h": "Filtro externo hang-on 600L/h. Triplo estágio de filtragem.",
    "Esponja Biológica Média": "Esponja de porosidade média para filtragem mecânica e biológica. Reutilizável.",
    "Mídia Cerâmica 1kg": "Anéis de cerâmica porosa para filtragem biológica. Pacote 1kg.",
    "Bomba Submersa 800L/h": "Bomba d'água submersa silenciosa. 800L/h, 12W.",
    "LED RGB 60cm 12W": "Fita LED RGB com controle remoto. Efeitos sunset e tempestade.",
    "LED Plantas 45cm 10W": "Luminária LED full spectrum para plantas aquáticas. 10W.",
    "Lâmpada UV 9W": "Lâmpada esterilizadora UV-C 9W para eliminar algas e bactérias.",
    "Timer Digital": "Timer digital programável 10 ciclos. Display LCD.",
    "Substrato Marchas 5kg": "Substrato fértil para plantas aquáticas. Rico em ferro. 5kg.",
    "Areia Preta 3kg": "Areia quartzítica preta granulometria fina. 3kg.",
    "Tronco Natural M": "Tronco natural de madeira apta para aquário. 20-30cm.",
    "Pedra Rio 1kg": "Pedras de rio polidas. Inertes. 1kg (~8-12 pedras).",
    "Planta Artificial 30cm": "Planta artificial de seda. Aspecto natural e sem manutenção.",
    "Ração Betta 50ml": "Ração peletizada para Bettas. 45% proteína. 50ml.",
    "Ração Flocos Premium 100ml": "Ração em flocos premium. 42% proteína. 100ml.",
    "Ração Grânulos 150ml": "Ração em grânulos médios. Afunda lentamente. 150ml.",
    "Comprimido Cascudo": "Pastilhas de fundo para cascudos. 10 comprimidos.",
    "Bloodworm Liofilizado 20ml": "Larva de mosquito liofilizada. Petisco rico em proteína.",
    "Kit Teste pH": "Kit completo para medição de pH. Escala 5.0-9.0.",
    "Condicionador 100ml": "Condicionador que neutraliza cloro e metais pesados. 100ml.",
    "Sifão Limpa Fundo": "Sifão manual com bulb e mangueira 1.5m.",
    "Cepilho Algas": "Cepilho magnético para limpeza de vidro. Para vidros até 8mm.",
    "Termostato 100W": "Termostato digital 100W. Display LED. Para aquários até 60L.",
}

fotos = {
    "Betta Splendens": "https://images.unsplash.com/photo-1520366498724-709889c0c685?w=400&h=400&fit=crop",
    "Guppy Trio": "https://images.unsplash.com/photo-1570453904318-53f64b19d81a?w=400&h=400&fit=crop",
    "Acará Bandeira": "https://images.unsplash.com/photo-1586282015467-3a36c43d8a57?w=400&h=400&fit=crop",
    "Corydora Albina": "https://images.unsplash.com/photo-1545340534-32e99207577e?w=400&h=400&fit=crop",
    "Tetra Neon": "https://images.unsplash.com/photo-1510318418409-62a1eb9d1d74?w=400&h=400&fit=crop",
    "Limpa Vidro (Otocinclus)": "https://images.unsplash.com/photo-1600393793741-f7d89e7f19f6?w=400&h=400&fit=crop",
    "Aquário 30L c/ Kit": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=400&fit=crop",
    "Aquário 60L c/ Filtro": "https://images.unsplash.com/photo-1585945369050-6fe5c6d28b29?w=400&h=400&fit=crop",
    "Aquário 120L Stand": "https://images.unsplash.com/photo-1551887373-3c5bd224f6e2?w=400&h=400&fit=crop",
    "Mini Aquário 15L": "https://images.unsplash.com/photo-1512127353238-e1fa6a9ffbb9?w=400&h=400&fit=crop",
    "Filtro Interno 300L/h": "https://images.unsplash.com/photo-1620327467532-6ebaca6273ed?w=400&h=400&fit=crop",
    "Filtro Hang-On 600L/h": "https://images.unsplash.com/photo-1585351930947-ee1ffbbcacde?w=400&h=400&fit=crop",
    "Bomba Submersa 800L/h": "https://images.unsplash.com/photo-1593197953817-1c8a49c5b84b?w=400&h=400&fit=crop",
    "LED RGB 60cm 12W": "https://images.unsplash.com/photo-1569474039636-25b8f4880639?w=400&h=400&fit=crop",
    "LED Plantas 45cm 10W": "https://images.unsplash.com/photo-1667504032561-23b01b49e2aa?w=400&h=400&fit=crop",
    "Timer Digital": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
    "Substrato Marchas 5kg": "https://images.unsplash.com/photo-1599571234902-5d90c3e6098f?w=400&h=400&fit=crop",
    "Tronco Natural M": "https://images.unsplash.com/photo-1548814817-23e29dc420f5?w=400&h=400&fit=crop",
    "Planta Artificial 30cm": "https://images.unsplash.com/photo-1533779183510-8cc0de8e60e6?w=400&h=400&fit=crop",
    "Ração Betta 50ml": "https://images.unsplash.com/photo-1565708096664-68d297f5df36?w=400&h=400&fit=crop",
    "Ração Flocos Premium 100ml": "https://images.unsplash.com/photo-1604053135307-d7b1c3c07e8b?w=400&h=400&fit=crop",
    "Comprimido Cascudo": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
    "Kit Teste pH": "https://images.unsplash.com/photo-1634097757366-726f9f1f0371?w=400&h=400&fit=crop",
    "Condicionador 100ml": "https://images.unsplash.com/photo-1598392019988-21d256f7510f?w=400&h=400&fit=crop",
    "Sifão Limpa Fundo": "https://images.unsplash.com/photo-1636622433525-127afdf3662d?w=400&h=400&fit=crop",
    "Termostato 100W": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=400&fit=crop",
}


async def atualizar():
    async with async_session() as session:
        result = await session.execute(select(Produto))
        produtos = result.scalars().all()
        for p in produtos:
            alterado = False
            if p.nome in descricoes and not p.descricao:
                p.descricao = descricoes[p.nome]
                alterado = True
            if p.nome in fotos and not p.foto_url:
                p.foto_url = fotos[p.nome]
                alterado = True
            if not p.foto_url:
                p.foto_url = img_seed(p.nome)
                alterado = True
            if not p.descricao:
                p.descricao = f"{p.nome} - Produto de qualidade para seu aquário."
                alterado = True
            if alterado:
                print(f"  Atualizado: {p.nome}")
        await session.commit()
        print(f"\n{len(produtos)} produtos verificados, alterados com sucesso!")


asyncio.run(atualizar())
