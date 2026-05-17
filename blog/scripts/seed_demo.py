import argparse
import asyncio
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
import struct
import sys
import zlib

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.database import SessionLocal, init_db
from app.models.category import Category
from app.models.post import Post
from app.models.tag import Tag
from app.models.user import User
from app.services.media_service import MediaUploadError, upload_featured_image
from app.utils.slug import slugify

SEED_MARKER = "Seed marker: managed demo content for blog seeding."
POST_COUNT = 20


@dataclass
class DemoUploadFile:
    filename: str
    content_type: str
    content: bytes

    async def read(self) -> bytes:
        return self.content


def png_chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack("!I", len(data)) + kind + data + struct.pack("!I", zlib.crc32(kind + data) & 0xFFFFFFFF)


def demo_png(width: int, height: int, start: tuple[int, int, int], end: tuple[int, int, int]) -> bytes:
    rows = []
    for y in range(height):
        row = bytearray()
        for x in range(width):
            mix = (x + y) / max(1, width + height - 2)
            row.extend(int(start[i] * (1 - mix) + end[i] * mix) for i in range(3))
        rows.append(b"\x00" + bytes(row))
    return b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", struct.pack("!IIBBBBB", width, height, 8, 2, 0, 0, 0)) + png_chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + png_chunk(b"IEND", b"")


DEMO_CATEGORIES = [
    ("Engineering", "Architecture notes, implementation details, and practical software decisions.", True, 1),
    ("Product", "Product thinking, launch notes, and user-centered tradeoffs.", True, 2),
    ("Design", "Interface polish, content structure, and visual systems.", True, 3),
    ("Operations", "Deployment, reliability, and maintenance lessons.", False, 0),
]

DEMO_TAGS = [
    ("FastAPI", True, 1),
    ("UX", True, 2),
    ("Python", True, 3),
    ("Launch", True, 4),
    ("Testing", True, 5),
    ("Cloud", False, 0),
    ("Frontend", True, 6),
    ("Data", False, 0),
]

DEMO_POSTS = [
    ("Designing a Faster Editorial Workflow", "A practical look at reducing friction in a small publishing stack.", "Product", ["UX", "Launch"], 184),
    ("FastAPI Patterns That Keep Routes Small", "How focused service functions make route handlers easier to test.", "Engineering", ["FastAPI", "Python"], 312),
    ("What Makes a Blog Homepage Feel Alive", "Balancing featured stories, recency, and discovery modules.", "Design", ["UX", "Frontend"], 241),
    ("Shipping Search Without Overbuilding It", "Simple search affordances that cover the most common reader needs.", "Product", ["Testing", "UX"], 96),
    ("The Case for Boring Deployment Checks", "Why health checks, logs, and repeatable commands matter more than cleverness.", "Operations", ["Cloud", "Testing"], 277),
    ("A Small Guide to Post Metadata", "Dates, read time, categories, tags, and views help readers choose what to open.", "Design", ["Frontend", "UX"], 153),
    ("Keeping Admin Forms Friendly", "File uploads and validation states should explain failures clearly.", "Engineering", ["FastAPI", "UX"], 221),
    ("How Tags Improve Content Discovery", "Tags work best when they express recurring themes instead of one-off labels.", "Product", ["Data", "UX"], 138),
    ("Testing Public Pages Like a Reader", "End-to-end checks catch navigation, image, and layout issues unit tests miss.", "Engineering", ["Testing", "Frontend"], 354),
    ("Planning a Lightweight Content Taxonomy", "A practical structure for categories, tags, and related post journeys.", "Product", ["Data", "Launch"], 119),
    ("Making Image Uploads Observable", "Useful logs can make external media failures much easier to diagnose.", "Operations", ["Cloud", "Testing"], 402),
    ("Responsive Cards That Carry Their Weight", "Post cards should communicate topic, timing, popularity, and next action.", "Design", ["Frontend", "UX"], 288),
    ("When to Refresh Data After a Write", "Refreshing ORM objects after counters change avoids stale UI details.", "Engineering", ["Python", "Testing"], 199),
    ("What Trending Lists Should Optimize For", "Popularity modules are most useful when they reveal genuine reader interest.", "Product", ["Data", "UX"], 467),
    ("A Calm Launch Checklist for Small Apps", "A compact checklist for routes, data, media, and browser verification.", "Operations", ["Launch", "Cloud"], 176),
    ("Building a FastAPI Blog That Feels Fast", "Practical choices that make a server-rendered blog feel responsive.", "Engineering", ["FastAPI", "Python"], 338),
    ("Search UX Patterns for Editorial Sites", "Small search decisions that make archives easier to explore.", "Design", ["UX", "Frontend"], 207),
    ("Creating a Content Calendar That Ships", "A lightweight cadence for turning ideas into published articles.", "Product", ["Launch", "Data"], 165),
    ("Using Categories Without Creating Clutter", "How broad categories keep navigation useful without overwhelming readers.", "Product", ["UX", "Data"], 143),
    ("Polishing Empty States and Error Pages", "Clear fallback states make a content site feel maintained and trustworthy.", "Design", ["UX", "Frontend"], 254),
]

PALETTE = [
    ((37, 99, 235), (147, 197, 253)),
    ((15, 23, 42), (45, 212, 191)),
    ((220, 38, 38), (254, 202, 202)),
    ((124, 58, 237), (221, 214, 254)),
    ((22, 163, 74), (187, 247, 208)),
]


async def upload_demo_images(count: int) -> list[str]:
    urls = []
    for index in range(count):
        start, end = PALETTE[index % len(PALETTE)]
        image = demo_png(960, 540, start, end)
        file = DemoUploadFile(filename=f"demo-blog-image-{index + 1}.png", content_type="image/png", content=image)
        urls.append(await upload_featured_image(file))
    return urls


def get_or_create_category(db, name: str, description: str, show_on_home: bool, home_order: int) -> Category:
    category = db.scalar(select(Category).where(Category.name == name))
    if category is None:
        category = Category(name=name, slug=slugify(name), description=description)
        db.add(category)
        db.flush()
    elif not category.description:
        category.description = description
    category.show_on_home = show_on_home
    category.home_order = home_order
    return category


def get_or_create_tag(db, name: str, show_on_home: bool, home_order: int) -> Tag:
    tag = db.scalar(select(Tag).where(Tag.name == name))
    if tag is None:
        tag = Tag(name=name, slug=slugify(name))
        db.add(tag)
        db.flush()
    tag.show_on_home = show_on_home
    tag.home_order = home_order
    return tag


def desired_demo_slugs() -> set[str]:
    return {slugify(title) for title, *_ in DEMO_POSTS[:POST_COUNT]}


def is_demo_post(post: Post) -> bool:
    slug = post.slug or ""
    title = post.title or ""
    content = post.content or ""
    return (
        slug in desired_demo_slugs()
        or slug.startswith(("demo-", "test-", "seed-", "testing-fastapi-blog-", "archive-post-", "imageless-top-", "count-imageless-", "count-visible-", "image-backed-top-", "image-backed-low-", "low-views-", "high-views-", "with-image-", "edit-existing-image-", "edit-missing-image-", "no-image-"))
        or title.startswith(("Demo ", "Test "))
        or SEED_MARKER in content
    )


def cleanup_extra_demo_posts(db, keep_slugs: set[str]) -> tuple[int, int, int]:
    demo_posts = [post for post in db.scalars(select(Post).order_by(Post.published_at.desc().nullslast(), Post.created_at.desc())).all() if is_demo_post(post)]
    before = len(demo_posts)
    deleted = 0
    for post in demo_posts:
        if post.slug not in keep_slugs:
            db.delete(post)
            deleted += 1
    db.commit()
    remaining = before - deleted
    print(f"demo cleanup: existed before cleanup={before}, deleted={deleted}, remaining={remaining}")
    return before, deleted, remaining


def seed_posts(image_urls: list[str]) -> tuple[int, int, int]:
    init_db()
    db = SessionLocal()
    try:
        author = db.scalar(select(User).order_by(User.id))
        categories = {name: get_or_create_category(db, name, description, show_on_home, home_order) for name, description, show_on_home, home_order in DEMO_CATEGORIES}
        tags = {name: get_or_create_tag(db, name, show_on_home, home_order) for name, show_on_home, home_order in DEMO_TAGS}
        now = datetime.now(timezone.utc)
        created = 0
        updated = 0
        keep_slugs = desired_demo_slugs()
        for index, (title, summary, category_name, tag_names, views_count) in enumerate(DEMO_POSTS[:POST_COUNT]):
            slug = slugify(title)
            post = db.scalar(select(Post).where(Post.slug == slug))
            content = (
                f"{summary}\n\n"
                "This demo article is seeded to exercise public browsing, taxonomy pages, search, related posts, image rendering, and view-count sorting.\n\n"
                "It uses the same Post, Category, Tag, and media upload flow as regular admin-created content.\n\n"
                f"{SEED_MARKER}"
            )
            if post is None:
                post = Post(title=title, slug=slug, content=content, author_id=author.id if author else None)
                db.add(post)
                created += 1
            else:
                updated += 1
            post.summary = summary
            post.content = content
            post.status = "published"
            post.is_featured = index == 0
            post.category = categories[category_name]
            post.tags = [tags[name] for name in tag_names]
            post.featured_image_url = image_urls[index]
            post.views_count = views_count
            post.published_at = now - timedelta(days=index)
        db.commit()
        cleanup_extra_demo_posts(db, keep_slugs)
        return len(categories), len(tags), created + updated
    finally:
        db.close()


async def main() -> None:
    parser = argparse.ArgumentParser(description="Seed demo blog posts with images uploaded through the configured media API.")
    parser.add_argument("--posts", type=int, default=POST_COUNT, choices=[POST_COUNT], help="Number of demo posts to seed.")
    args = parser.parse_args()
    try:
        image_urls = await upload_demo_images(args.posts)
    except MediaUploadError as exc:
        raise SystemExit(f"Demo seed aborted: media upload failed before database writes. {exc}") from exc
    category_count, tag_count, post_count = seed_posts(image_urls)
    print(f"Seeded {category_count} categories, {tag_count} tags, {post_count} posts, and {len(image_urls)} uploaded images.")


if __name__ == "__main__":
    asyncio.run(main())
