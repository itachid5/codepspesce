import re
from uuid import uuid4

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.post import Post
from app.services.media_service import MediaUploadError


def test_admin_pages_render(admin_client):
    for path in ["/admin/dashboard", "/admin/posts", "/admin/posts/create", "/admin/categories", "/admin/tags", "/admin/pages", "/admin/settings"]:
        response = admin_client.get(path)
        assert response.status_code == 200
        assert "admin" in response.text.lower() or "dashboard" in response.text.lower()


def test_taxonomy_menu_controls(admin_client):
    suffix = uuid4().hex[:8]
    category_name = f"Menu Category {suffix}"
    tag_name = f"Menu Tag {suffix}"
    response = admin_client.post(
        "/admin/categories",
        data={"name": category_name, "description": "Shown", "show_in_menu": "true", "menu_order": "7", "show_on_home": "true", "home_order": "2"},
        follow_redirects=False,
    )
    assert response.status_code == 303
    response = admin_client.post(
        "/admin/tags",
        data={"name": tag_name, "show_in_menu": "true", "menu_order": "3", "show_on_home": "true", "home_order": "4"},
        follow_redirects=False,
    )
    assert response.status_code == 303

    categories = admin_client.get("/admin/categories")
    tags = admin_client.get("/admin/tags")
    assert category_name in categories.text
    assert tag_name in tags.text
    assert "Show on Homepage" in categories.text
    assert "Show on Homepage" in tags.text
    assert "value=\"7\"" in categories.text
    assert "value=\"2\"" in categories.text
    assert "value=\"3\"" in tags.text
    assert "value=\"4\"" in tags.text
    assert "checked" in categories.text
    assert "checked" in tags.text

    category_id = re.search(rf'value="{category_name}".*?/admin/categories/(\d+)/update', categories.text, re.S).group(1)
    tag_id = re.search(rf'value="{tag_name}".*?/admin/tags/(\d+)/update', tags.text, re.S).group(1)
    assert admin_client.post(f"/admin/categories/{category_id}/update", data={"name": category_name, "description": "Hidden", "menu_order": "9", "show_on_home": "true", "home_order": "11"}, follow_redirects=False).status_code == 303
    assert admin_client.post(f"/admin/tags/{tag_id}/update", data={"name": tag_name, "menu_order": "5", "show_on_home": "true", "home_order": "13"}, follow_redirects=False).status_code == 303
    categories = admin_client.get("/admin/categories").text
    tags = admin_client.get("/admin/tags").text
    assert "value=\"9\"" in categories
    assert "value=\"11\"" in categories
    assert "value=\"5\"" in tags
    assert "value=\"13\"" in tags


def test_settings_update(admin_client):
    response = admin_client.post(
        "/admin/settings",
        data={
            "site_name": "Blog Website",
            "site_description": "Updated from tests",
            "logo_url": "",
            "twitter_url": "",
            "github_url": "",
            "linkedin_url": "",
        },
        follow_redirects=False,
    )
    assert response.status_code == 303
    home = admin_client.get("/")
    assert "Updated from tests" in home.text


def test_create_post_without_featured_image_is_blocked(admin_client):
    suffix = uuid4().hex[:8]
    response = admin_client.post(
        "/admin/posts/create",
        data={
            "title": f"No Image {suffix}",
            "slug": f"no-image-{suffix}",
            "summary": "Missing image summary.",
            "content": "Missing image content.",
            "status": "published",
        },
    )
    assert response.status_code == 400
    assert "Featured image is required. Please upload an image before saving the post." in response.text

    db = SessionLocal()
    try:
        assert db.scalar(select(Post).where(Post.slug == f"no-image-{suffix}")) is None
    finally:
        db.close()


def test_create_post_with_featured_image_succeeds(admin_client):
    suffix = uuid4().hex[:8]
    slug = f"with-image-{suffix}"
    response = admin_client.post(
        "/admin/posts/create",
        data={
            "title": f"With Image {suffix}",
            "slug": slug,
            "summary": "Uploaded image summary.",
            "content": "Uploaded image content.",
            "status": "published",
        },
        files={"featured_image": (f"{slug}.png", b"fake image", "image/png")},
        follow_redirects=False,
    )
    assert response.status_code == 303

    db = SessionLocal()
    try:
        post = db.scalar(select(Post).where(Post.slug == slug))
        assert post is not None
        assert post.featured_image_url == f"https://cdn.example.test/{slug}.png"
    finally:
        db.close()


def test_edit_post_with_existing_featured_image_succeeds_without_replacement(admin_client):
    suffix = uuid4().hex[:8]
    slug = f"edit-existing-image-{suffix}"
    admin_client.post(
        "/admin/posts/create",
        data={
            "title": f"Edit Existing Image {suffix}",
            "slug": slug,
            "summary": "Original summary.",
            "content": "Original content.",
            "status": "published",
        },
        files={"featured_image": (f"{slug}.png", b"fake image", "image/png")},
        follow_redirects=False,
    )

    db = SessionLocal()
    try:
        post = db.scalar(select(Post).where(Post.slug == slug))
        assert post is not None
        post_id = post.id
        image_url = post.featured_image_url
    finally:
        db.close()

    response = admin_client.post(
        f"/admin/posts/{post_id}/edit",
        data={
            "title": f"Edit Existing Image Updated {suffix}",
            "slug": slug,
            "summary": "Updated summary.",
            "content": "Updated content.",
            "status": "published",
        },
        follow_redirects=False,
    )
    assert response.status_code == 303

    db = SessionLocal()
    try:
        post = db.scalar(select(Post).where(Post.id == post_id))
        assert post is not None
        assert post.featured_image_url == image_url
        assert post.summary == "Updated summary."
    finally:
        db.close()


def test_edit_post_without_effective_featured_image_is_blocked(admin_client):
    suffix = uuid4().hex[:8]
    slug = f"edit-missing-image-{suffix}"
    db = SessionLocal()
    try:
        post = Post(title=f"Edit Missing Image {suffix}", slug=slug, summary="No image.", content="No image content.", status="draft", featured_image_url="")
        db.add(post)
        db.commit()
        db.refresh(post)
        post_id = post.id
    finally:
        db.close()

    response = admin_client.post(
        f"/admin/posts/{post_id}/edit",
        data={
            "title": f"Edit Missing Image Updated {suffix}",
            "slug": slug,
            "summary": "Still no image.",
            "content": "Still no image content.",
            "status": "published",
        },
    )
    assert response.status_code == 400
    assert "Featured image is required. Please upload an image before saving the post." in response.text


def test_post_image_upload_failure_rerenders_form(admin_client, monkeypatch):
    async def fail_upload(file):
        raise MediaUploadError("Media upload service returned no image URL.")

    monkeypatch.setattr("app.routes.posts.upload_featured_image", fail_upload)
    response = admin_client.post(
        "/admin/posts/create",
        data={
            "title": "Upload Failure Test",
            "slug": "upload-failure-test",
            "summary": "Upload failure summary.",
            "content": "Upload failure content.",
            "status": "published",
        },
        files={"featured_image": ("failure.png", b"not really an image", "image/png")},
    )
    assert response.status_code == 400
    assert "Media upload service returned no image URL." in response.text
    assert "Save Post" in response.text
