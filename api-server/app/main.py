from pathlib import Path

from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.cloudinary import CloudinaryConfigurationError
from app.core.config import get_settings
from app.web.routes import router as web_router

APP_DIR = Path(__file__).resolve().parent


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        description="A modular FastAPI website and API platform.",
        version="0.1.0",
    )
    app.mount("/static", StaticFiles(directory=APP_DIR / "static"), name="static")

    @app.exception_handler(CloudinaryConfigurationError)
    async def cloudinary_configuration_error(
        request: Request, exc: CloudinaryConfigurationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"success": False, "message": str(exc)},
        )

    @app.get("/health", tags=["Health"])
    async def health_check() -> dict[str, str]:
        return {
            "status": "ok",
            "service": settings.app_name,
            "environment": settings.app_env,
        }

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon() -> Response:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    app.include_router(web_router)
    app.include_router(api_router)
    return app


app = create_app()
