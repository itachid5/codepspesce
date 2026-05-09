from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.utils.slug import slugify


def create_category(db: Session, name: str, description: str = "") -> Category:
    category = Category(name=name.strip(), slug=unique_category_slug(db, name), description=description.strip())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


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
