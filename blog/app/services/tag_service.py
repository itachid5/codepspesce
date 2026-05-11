from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.post import Post, post_tags
from app.models.tag import Tag
from app.utils.slug import slugify


def create_tag(db: Session, name: str) -> Tag:
    tag = Tag(name=name.strip(), slug=unique_tag_slug(db, name))
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def tags_with_published_counts(db: Session) -> list[tuple[Tag, int]]:
    return db.execute(
        select(Tag, func.count(Post.id))
        .outerjoin(post_tags, post_tags.c.tag_id == Tag.id)
        .outerjoin(Post, (Post.id == post_tags.c.post_id) & (Post.status == "published"))
        .group_by(Tag.id)
        .order_by(Tag.name)
    ).all()


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
