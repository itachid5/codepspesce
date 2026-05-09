from cloudinary import uploader
from fastapi import HTTPException, UploadFile, status

from app.api.cloudinary.schemas import CloudinaryUploadResponse
from app.core.cloudinary import configure_cloudinary
from app.core.config import Settings
from app.utils.file_validation import validate_upload_file


async def upload_media(file: UploadFile, settings: Settings) -> CloudinaryUploadResponse:
    contents = await validate_upload_file(file, settings.max_upload_size_bytes)
    configure_cloudinary(settings)

    try:
        result = uploader.upload(
            contents,
            resource_type="auto",
            filename=file.filename,
            use_filename=True,
            unique_filename=True,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Cloudinary upload failed. Please verify configuration and try again.",
        ) from exc
    finally:
        await file.close()

    return CloudinaryUploadResponse(
        secure_url=result["secure_url"],
        public_id=result["public_id"],
        resource_type=result.get("resource_type", "unknown"),
        format=result.get("format"),
        bytes=result.get("bytes"),
        original_filename=result.get("original_filename") or file.filename,
        asset_id=result.get("asset_id"),
        width=result.get("width"),
        height=result.get("height"),
    )
