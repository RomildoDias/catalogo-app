from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, categorias, produtos, loja, admin, lojistas

app = FastAPI(title="CatálogoApp API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(produtos.router)
app.include_router(loja.router)
app.include_router(admin.router)
app.include_router(lojistas.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
