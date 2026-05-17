from fastapi import APIRouter, Depends, Request
from app.utils.templates import create_templates
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.post import Post
from app.routes.deps import require_admin
from app.services.post_service import dashboard_counts
from app.services.setting_service import get_settings_map
from app.utils.formatting import format_count, format_views

router = APIRouter(prefix="/admin")
templates = create_templates()


@router.get("")
def admin_home():
    from fastapi.responses import RedirectResponse

    return RedirectResponse("/admin/dashboard", status_code=303)


@router.get("/dashboard")
def dashboard(request: Request, db: Session = Depends(get_db)):
    admin = require_admin(request, db)
    recent_posts = db.scalars(select(Post).order_by(Post.created_at.desc()).limit(6)).all()
    return templates.TemplateResponse(
        "admin/dashboard.html",
        {"request": request, "admin": admin, "counts": dashboard_counts(db), "recent_posts": recent_posts, "settings": get_settings_map(db), "format_count": format_count, "format_views": format_views},
    )
