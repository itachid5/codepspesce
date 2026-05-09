from datetime import datetime, timezone

from sqlalchemy import func, or_, select, update
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.post import Post
from app.models.tag import Tag
from app.utils.slug import slugify


def unique_post_slug(db: Session, value: str, post_id: int | None = None) -> str:
    base = slugify(value)
    slug = base
    count = 2
    while True:
        query = select(Post).where(Post.slug == slug)
        if post_id is not None:
            query = query.where(Post.id != post_id)
        if db.scalar(query) is None:
            return slug
        slug = f"{base}-{count}"
        count += 1


def published_posts_query():
    return (
        select(Post)
        .where(Post.status == "published")
        .options(selectinload(Post.category), selectinload(Post.tags), selectinload(Post.author))
    )


def latest_posts(db: Session, limit: int = 9) -> list[Post]:
    return db.scalars(published_posts_query().order_by(Post.published_at.desc().nullslast(), Post.created_at.desc()).limit(limit)).all()


def trending_posts(db: Session, limit: int = 5) -> list[Post]:
    return db.scalars(published_posts_query().order_by(Post.views_count.desc(), Post.published_at.desc().nullslast()).limit(limit)).all()


def featured_post(db: Session) -> Post | None:
    return db.scalar(published_posts_query().where(Post.is_featured.is_(True)).order_by(Post.published_at.desc().nullslast()).limit(1))


def get_published_post(db: Session, slug: str) -> Post | None:
    return db.scalar(published_posts_query().where(Post.slug == slug))


def increment_views(db: Session, post: Post) -> None:
    db.execute(update(Post).where(Post.id == post.id).values(views_count=Post.views_count + 1))
    db.commit()
    db.refresh(post)


def search_posts(db: Session, q: str) -> list[Post]:
    term = f"%{q.strip()}%"
    if not q.strip():
        return []
    return db.scalars(
        published_posts_query()
        .join(Category, Post.category_id == Category.id, isouter=True)
        .join(Post.tags, isouter=True)
        .where(
            or_(
                Post.title.ilike(term),
                Post.summary.ilike(term),
                Post.content.ilike(term),
                Category.name.ilike(term),
                Tag.name.ilike(term),
            )
        )
        .distinct()
        .order_by(Post.published_at.desc().nullslast(), Post.created_at.desc())
    ).all()


def posts_by_category(db: Session, category: Category) -> list[Post]:
    return db.scalars(published_posts_query().where(Post.category_id == category.id).order_by(Post.published_at.desc().nullslast())).all()


def posts_by_tag(db: Session, tag: Tag) -> list[Post]:
    return db.scalars(published_posts_query().join(Post.tags).where(Tag.id == tag.id).order_by(Post.published_at.desc().nullslast())).all()


def create_or_update_post(
    db: Session,
    *,
    title: str,
    slug: str,
    summary: str,
    content: str,
    status: str,
    is_featured: bool,
    category_id: int | None,
    tag_ids: list[int],
    author_id: int | None,
    featured_image_url: str = "",
    post: Post | None = None,
) -> Post:
    clean_status = "published" if status == "published" else "draft"
    final_slug = unique_post_slug(db, slug or title, post.id if post else None)
    if post is None:
        post = Post(title=title.strip(), slug=final_slug, content=content.strip(), author_id=author_id)
        db.add(post)
    post.title = title.strip()
    post.slug = final_slug
    post.summary = summary.strip()
    post.content = content.strip()
    post.status = clean_status
    post.is_featured = is_featured
    post.category_id = category_id
    if featured_image_url:
        post.featured_image_url = featured_image_url
    if clean_status == "published" and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)
    if clean_status == "draft":
        post.published_at = None
    post.tags = db.scalars(select(Tag).where(Tag.id.in_(tag_ids))).all() if tag_ids else []
    db.commit()
    db.refresh(post)
    return post


def dashboard_counts(db: Session) -> dict[str, int]:
    return {
        "total_posts": db.scalar(select(func.count(Post.id))) or 0,
        "published_posts": db.scalar(select(func.count(Post.id)).where(Post.status == "published")) or 0,
        "draft_posts": db.scalar(select(func.count(Post.id)).where(Post.status == "draft")) or 0,
        "categories": db.scalar(select(func.count(Category.id))) or 0,
        "tags": db.scalar(select(func.count(Tag.id))) or 0,
    }
