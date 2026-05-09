from fastapi import FastAPI, Response, status
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import get_settings
from app.web.routes import router as web_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        description="A modular FastAPI website and API platform.",
        version="0.1.0",
    )
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon() -> Response:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    app.include_router(web_router)
    app.include_router(api_router)
    return app


app = create_app()
