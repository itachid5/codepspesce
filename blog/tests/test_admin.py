import re
from uuid import uuid4

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
        data={"name": category_name, "description": "Shown", "show_in_menu": "true", "menu_order": "7"},
        follow_redirects=False,
    )
    assert response.status_code == 303
    response = admin_client.post(
        "/admin/tags",
        data={"name": tag_name, "show_in_menu": "true", "menu_order": "3"},
        follow_redirects=False,
    )
    assert response.status_code == 303

    categories = admin_client.get("/admin/categories")
    tags = admin_client.get("/admin/tags")
    assert category_name in categories.text
    assert tag_name in tags.text
    assert "value=\"7\"" in categories.text
    assert "value=\"3\"" in tags.text
    assert "checked" in categories.text
    assert "checked" in tags.text

    category_id = re.search(rf'value="{category_name}".*?/admin/categories/(\d+)/update', categories.text, re.S).group(1)
    tag_id = re.search(rf'value="{tag_name}".*?/admin/tags/(\d+)/update', tags.text, re.S).group(1)
    assert admin_client.post(f"/admin/categories/{category_id}/update", data={"name": category_name, "description": "Hidden", "menu_order": "9"}, follow_redirects=False).status_code == 303
    assert admin_client.post(f"/admin/tags/{tag_id}/update", data={"name": tag_name, "menu_order": "5"}, follow_redirects=False).status_code == 303
    assert "value=\"9\"" in admin_client.get("/admin/categories").text
    assert "value=\"5\"" in admin_client.get("/admin/tags").text


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
