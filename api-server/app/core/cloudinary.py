import cloudinary

from app.core.config import Settings

CLOUDINARY_MISSING_CONFIG_MESSAGE = (
    "Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, "
    "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
)


class CloudinaryConfigurationError(RuntimeError):
    pass


def configure_cloudinary(settings: Settings) -> None:
    if not settings.cloudinary_is_configured():
        raise CloudinaryConfigurationError(CLOUDINARY_MISSING_CONFIG_MESSAGE)

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
