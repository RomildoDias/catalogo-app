from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import auth, categorias, produtos, loja, admin, lojistas

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"


@asynccontextmanager
async def lifespan(app: FastAPI):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="CatálogoApp API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_origin_regex=r"^https://[a-z0-9-]+\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "0"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(produtos.router)
app.include_router(loja.router)
app.include_router(admin.router)
app.include_router(lojistas.router)

# Serve o catálogo público (HTML/JS/CSS vanilla)
catalogo_paths = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "catalogo",  # local dev
    Path(__file__).resolve().parent.parent / "frontend" / "catalogo",         # docker
    Path.cwd() / "frontend" / "catalogo",                                     # fallback
]
catalogo_path = next((p for p in catalogo_paths if p.exists()), None)
if catalogo_path:
    app.mount("/catalogo", StaticFiles(directory=str(catalogo_path), html=True), name="catalogo")

# Serve as imagens enviadas pelos lojistas
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/robots.txt")
async def robots():
    return PlainTextResponse("User-agent: *\nDisallow: /\n")

@app.get("/health")
async def health():
    from datetime import datetime, timezone
    from app.database import async_session
    from sqlalchemy import text
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        db_ok = False
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "error",
        "version": "0.1.0",
        "uptime": datetime.now(timezone.utc).isoformat(),
    }
