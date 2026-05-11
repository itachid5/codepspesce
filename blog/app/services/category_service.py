from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.post import Post
from app.utils.slug import slugify


def create_category(db: Session, name: str, description: str = "") -> Category:
    category = Category(name=name.strip(), slug=unique_category_slug(db, name), description=description.strip())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def categories_with_published_counts(db: Session) -> list[tuple[Category, int]]:
    return db.execute(
        select(Category, func.count(Post.id))
        .outerjoin(Post, (Post.category_id == Category.id) & (Post.status == "published"))
        .group_by(Category.id)
        .order_by(Category.name)
    ).all()


def unique_category_slug(db: Session, value: str, category_id: int | None = None) -> str:
    base = slugify(value)
    slug = base
    count = 2
    while True:
        query = select(Category).where(Category.slug == slug)
        if category_id is not None:
            query = query.where(Category.id != category_id)
        if db.scalar(query) is None:
            return slug
        slug = f"{base}-{count}"
        count += 1
