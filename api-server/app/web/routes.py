from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.core.config import get_settings

TEMPLATE_DIR = Path(__file__).resolve().parents[1] / "templates"
templates = Jinja2Templates(directory=TEMPLATE_DIR)
router = APIRouter(tags=["Web"])


@router.get("/", response_class=HTMLResponse)
async def home(request: Request) -> HTMLResponse:
    settings = get_settings()
    return templates.TemplateResponse(
        request,
        "index.html",
        {"app_name": settings.app_name},
    )


@router.get("/cloudinary", response_class=HTMLResponse)
@router.get("/docs/cloudinary", response_class=HTMLResponse)
async def cloudinary_docs(request: Request) -> HTMLResponse:
    settings = get_settings()
    return templates.TemplateResponse(
        request,
        "cloudinary.html",
        {"app_name": settings.app_name, "max_upload_size_mb": settings.max_upload_size_mb},
    )
