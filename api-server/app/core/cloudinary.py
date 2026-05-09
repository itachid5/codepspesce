import cloudinary

from app.core.config import Settings


def configure_cloudinary(settings: Settings) -> None:
    if not settings.cloudinary_is_configured():
        missing = [
            name
            for name, value in {
                "CLOUDINARY_CLOUD_NAME": settings.cloudinary_cloud_name,
                "CLOUDINARY_API_KEY": settings.cloudinary_api_key,
                "CLOUDINARY_API_SECRET": settings.cloudinary_api_secret,
            }.items()
            if not value
        ]
        raise RuntimeError(f"Missing Cloudinary environment variables: {', '.join(missing)}")

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
