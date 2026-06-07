"""Service para upload de imagens via Cloudinary.

Nota: Cloudinary SDK é síncrono. Em produção, considere rodar em
thread separada com asyncio.to_thread para não bloquear o event loop.
"""

from app.config import settings


def upload_imagem(arquivo: bytes, public_id: str) -> str | None:
    if not settings.cloudinary_cloud_name:
        return None
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
        )
        result = cloudinary.uploader.upload(arquivo, public_id=public_id)
        return result.get("secure_url")
    except Exception:
        return None


def deletar_imagem(public_id: str) -> None:
    if not settings.cloudinary_cloud_name:
        return
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
        )
        cloudinary.uploader.destroy(public_id)
    except Exception:
        pass
