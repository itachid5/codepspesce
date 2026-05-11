import logging

from fastapi import UploadFile
import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


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
    except httpx.HTTPStatusError as exc:
        logger.warning("Media upload failed with status %s: %s", exc.response.status_code, exc.response.text[:500])
        raise MediaUploadError("Media upload service is unavailable. Please try again later.") from exc
    except httpx.HTTPError as exc:
        logger.warning("Media upload request failed: %s", exc)
        raise MediaUploadError("Media upload service is unavailable. Please try again later.") from exc
    try:
        payload = response.json()
    except ValueError as exc:
        logger.warning("Media upload returned invalid JSON: %s", response.text[:500])
        raise MediaUploadError("Media upload service returned an invalid response.") from exc
    data = payload.get("data") if isinstance(payload.get("data"), dict) else {}
    secure_url = payload.get("secure_url") or data.get("secure_url")
    if not secure_url:
        logger.warning("Media upload response missing secure_url: %s", payload)
        raise MediaUploadError("Media upload service returned no image URL.")
    return secure_url
