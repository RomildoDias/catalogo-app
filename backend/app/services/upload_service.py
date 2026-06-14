import uuid
from pathlib import Path

from fastapi import UploadFile, HTTPException, status

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
ALLOWED_CONTENT_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
MAGIC_BYTES = {
    "image/jpeg": [b"\xff\xd8\xff", b"\xff\xd8\xff\xe0", b"\xff\xd8\xff\xe1"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
}
MAX_SIZE = 5 * 1024 * 1024


def validar_magic_bytes(data: bytes, content_type: str) -> bool:
    magic_list = MAGIC_BYTES.get(content_type, [])
    for magic in magic_list:
        if data[:len(magic)] == magic:
            return True
    return False


def validar_arquivo(arquivo, content_type: str, max_size: int = MAX_SIZE) -> tuple[bytes, str]:
    if content_type not in ALLOWED_CONTENT_TYPES:
        from fastapi import HTTPException, status
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Formato não permitido. Use JPG, PNG ou WebP.")

    HEADER_SIZE = 32
    header = arquivo.read(HEADER_SIZE)

    if not validar_magic_bytes(header, content_type):
        from fastapi import HTTPException, status
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Conteúdo do arquivo não corresponde ao formato declarado.")

    data = header + arquivo.read()
    if len(data) > max_size:
        from fastapi import HTTPException, status
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Imagem deve ter no máximo 5MB.")

    return data, ALLOWED_CONTENT_TYPES[content_type]


async def salvar_foto(lojista_id: uuid.UUID, produto_id: uuid.UUID, arquivo: UploadFile) -> str:
    if arquivo.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Formato não permitido. Use JPG, PNG ou WebP.")

    ext = ALLOWED_CONTENT_TYPES[arquivo.content_type]

    # Lê apenas os primeiros bytes para checar magic + tamanho
    HEADER_SIZE = 32
    header = await arquivo.read(HEADER_SIZE)

    if not validar_magic_bytes(header, arquivo.content_type):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Conteúdo do arquivo não corresponde ao formato declarado.")

    # Lê o resto do arquivo
    data = header
    remaining = await arquivo.read()
    data += remaining

    if len(data) > MAX_SIZE:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Imagem deve ter no máximo 5MB.")

    dir_path = UPLOAD_DIR / str(lojista_id)
    dir_path.mkdir(parents=True, exist_ok=True)

    # Remove fotos antigas do mesmo produto
    for existing in dir_path.glob(f"{produto_id}.*"):
        existing.unlink()

    file_path = dir_path / f"{produto_id}.{ext}"
    file_path.write_bytes(data)

    return f"/uploads/{lojista_id}/{produto_id}.{ext}"


def remover_foto(url: str | None):
    if not url or not url.startswith("/uploads/"):
        return
    relative = url[len("/uploads/"):]
    # Sanitiza path traversal
    relative = relative.lstrip("/").replace("\\", "/")
    safe_path = relative.split("/")
    if any(part in ("..", ".") or part == "" for part in safe_path):
        return
    file_path = UPLOAD_DIR / relative
    # Verifica se o arquivo resolvido está dentro de UPLOAD_DIR
    resolved = file_path.resolve()
    if not str(resolved).startswith(str(UPLOAD_DIR.resolve())):
        return
    if resolved.exists():
        resolved.unlink()
