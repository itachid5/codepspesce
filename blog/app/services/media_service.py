from fastapi import UploadFile
import httpx

from app.core.config import get_settings


class MediaUploadError(Exception):
    pass


async def upload_featured_image(file: UploadFile | None) -> str:
    if file is None or not file.filename:
        return ""
    settings = get_settings()
    data = await file.read()
    if not data:
        return ""
    files = {"file": (file.filename, data, file.content_type or "application/octet-stream")}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(settings.media_upload_url, files=files)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise MediaUploadError("Media upload service is unavailable. Please try again later.") from exc
    payload = response.json()
    secure_url = payload.get("secure_url")
    if not secure_url:
        raise MediaUploadError("Media upload service returned no image URL.")
    return secure_url
