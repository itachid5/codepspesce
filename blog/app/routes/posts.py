from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from fastapi.responses import RedirectResponse
from app.utils.templates import create_templates
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.category import Category
from app.models.post import Post
from app.models.tag import Tag
from app.routes.deps import require_admin
from app.services.media_service import MediaUploadError, upload_featured_image
from app.services.post_service import create_or_update_post
from app.services.setting_service import get_settings_map
from app.utils.formatting import format_count, format_views

router = APIRouter(prefix="/admin/posts")
templates = create_templates()

FEATURED_IMAGE_REQUIRED_MESSAGE = "Featured image is required. Please upload an image before saving the post."


def form_data(db: Session) -> dict:
    return {
        "categories": db.scalars(select(Category).order_by(Category.name)).all(),
        "tags": db.scalars(select(Tag).order_by(Tag.name)).all(),
        "settings": get_settings_map(db),
    }


@router.get("")
def posts_list(request: Request, db: Session = Depends(get_db)):
    admin = require_admin(request, db)
    posts = db.scalars(select(Post).options(selectinload(Post.category), selectinload(Post.tags)).order_by(Post.created_at.desc())).all()
    return templates.TemplateResponse("admin/posts_list.html", {"request": request, "admin": admin, "posts": posts, "settings": get_settings_map(db), "format_count": format_count, "format_views": format_views})


@router.get("/create")
def create_form(request: Request, db: Session = Depends(get_db)):
    admin = require_admin(request, db)
    context = {"request": request, "admin": admin, "post": None, "error": ""}
    context.update(form_data(db))
    return templates.TemplateResponse("admin/post_create.html", context)


@router.post("/create")
async def create_post(
    request: Request,
    db: Session = Depends(get_db),
    title: str = Form(...),
    slug: str = Form(""),
    summary: str = Form(""),
    content: str = Form(...),
    status: str = Form("draft"),
    category_id: int | None = Form(None),
    tag_ids: list[int] = Form([]),
    is_featured: bool = Form(False),
    featured_image: UploadFile | None = File(None),
):
    admin = require_admin(request, db)
    try:
        image_url = await upload_featured_image(featured_image)
        if not image_url.strip():
            context = {"request": request, "admin": admin, "post": None, "error": FEATURED_IMAGE_REQUIRED_MESSAGE}
            context.update(form_data(db))
            return templates.TemplateResponse("admin/post_create.html", context, status_code=400)
        create_or_update_post(db, title=title, slug=slug, summary=summary, content=content, status=status, is_featured=is_featured, category_id=category_id, tag_ids=tag_ids, author_id=admin.id, featured_image_url=image_url)
    except MediaUploadError as exc:
        context = {"request": request, "admin": admin, "post": None, "error": str(exc)}
        context.update(form_data(db))
        return templates.TemplateResponse("admin/post_create.html", context, status_code=400)
    return RedirectResponse("/admin/posts", status_code=303)


@router.get("/{post_id}/edit")
def edit_form(post_id: int, request: Request, db: Session = Depends(get_db)):
    admin = require_admin(request, db)
    post = db.scalar(select(Post).options(selectinload(Post.tags)).where(Post.id == post_id))
    if post is None:
        return RedirectResponse("/admin/posts", status_code=303)
    context = {"request": request, "admin": admin, "post": post, "error": ""}
    context.update(form_data(db))
    return templates.TemplateResponse("admin/post_edit.html", context)


@router.post("/{post_id}/edit")
async def update_post(
    post_id: int,
    request: Request,
    db: Session = Depends(get_db),
    title: str = Form(...),
    slug: str = Form(""),
    summary: str = Form(""),
    content: str = Form(...),
    status: str = Form("draft"),
    category_id: int | None = Form(None),
    tag_ids: list[int] = Form([]),
    is_featured: bool = Form(False),
    featured_image: UploadFile | None = File(None),
):
    admin = require_admin(request, db)
    post = db.scalar(select(Post).options(selectinload(Post.tags)).where(Post.id == post_id))
    if post is None:
        return RedirectResponse("/admin/posts", status_code=303)
    try:
        image_url = await upload_featured_image(featured_image)
        if not (image_url or post.featured_image_url or "").strip():
            context = {"request": request, "admin": admin, "post": post, "error": FEATURED_IMAGE_REQUIRED_MESSAGE}
            context.update(form_data(db))
            return templates.TemplateResponse("admin/post_edit.html", context, status_code=400)
        create_or_update_post(db, title=title, slug=slug, summary=summary, content=content, status=status, is_featured=is_featured, category_id=category_id, tag_ids=tag_ids, author_id=admin.id, featured_image_url=image_url, post=post)
    except MediaUploadError as exc:
        context = {"request": request, "admin": admin, "post": post, "error": str(exc)}
        context.update(form_data(db))
        return templates.TemplateResponse("admin/post_edit.html", context, status_code=400)
    return RedirectResponse("/admin/posts", status_code=303)


@router.post("/{post_id}/delete")
def delete_post(post_id: int, request: Request, db: Session = Depends(get_db)):
    require_admin(request, db)
    post = db.get(Post, post_id)
    if post:
        db.delete(post)
        db.commit()
    return RedirectResponse("/admin/posts", status_code=303)
