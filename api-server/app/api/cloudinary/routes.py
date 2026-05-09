from fastapi import APIRouter, Depends, File, UploadFile, status

from app.api.cloudinary.schemas import CloudinaryUploadResponse
from app.api.cloudinary.service import upload_media
from app.core.config import Settings, get_settings

router = APIRouter(prefix="/cloudinary", tags=["Cloudinary"])


@router.post(
    "/upload",
    response_model=CloudinaryUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload media to Cloudinary",
)
async def upload_cloudinary_file(
    file: UploadFile = File(..., description="Image, video, audio, PDF, or supported document file"),
    settings: Settings = Depends(get_settings),
) -> CloudinaryUploadResponse:
    return await upload_media(file, settings)
