#!/usr/bin/env bash
set -e

echo "=== Running database setup ==="
python -c "
import asyncio
from app.database import engine, Base
from app.config import settings

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('Tables created/verified')

asyncio.run(init())
"

echo "=== Running seed ==="
python -m seed

echo "=== Updating product details ==="
python -m scripts.atualizar_produtos 2>/dev/null || echo "  (nada a atualizar)"

echo "=== Starting server ==="
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
