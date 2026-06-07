# CatálogoApp

Plataforma SaaS multi-tenant para lojistas criarem catálogos digitais públicos integrados ao WhatsApp.

## Stack

- **Backend:** Python + FastAPI + SQLAlchemy async + PostgreSQL
- **Frontend painel:** React + Vite + TailwindCSS
- **Catálogo público:** HTML + CSS + JS vanilla
- **Auth:** JWT (python-jose + bcrypt)
- **Upload:** Cloudinary

## Como rodar

```bash
docker-compose up --build
```

- API: http://localhost:8000
- Painel: http://localhost:5173
- Docs: http://localhost:8000/docs

## Estrutura

```
backend/          → API FastAPI
frontend/painel/  → Painel React (lojista + admin)
frontend/catalogo/ → Catálogo público (vanilla)
```

## Funcionalidades

- [x] Auth (register, login, JWT)
- [x] CRUD categorias
- [x] CRUD produtos
- [x] Loja pública via slug
- [ ] Upload de fotos (Cloudinary)
- [x] Catálogo público HTML/JS (vanilla)
- [x] Painel React — login + dashboard
- [ ] Upload de fotos (Cloudinary)
- [ ] Domínio próprio (plano Pro)
