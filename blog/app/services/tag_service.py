from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.tag import Tag
from app.utils.slug import slugify


def create_tag(db: Session, name: str) -> Tag:
    tag = Tag(name=name.strip(), slug=unique_tag_slug(db, name))
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def unique_tag_slug(db: Session, value: str, tag_id: int | None = None) -> str:
    base = slugify(value)
    slug = base
    count = 2
    while True:
        query = select(Tag).where(Tag.slug == slug)
        if tag_id is not None:
            query = query.where(Tag.id != tag_id)
        if db.scalar(query) is None:
            return slug
        slug = f"{base}-{count}"
        count += 1
