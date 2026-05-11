from app.services.media_service import MediaUploadError


def test_admin_pages_render(admin_client):
    for path in ["/admin/dashboard", "/admin/posts", "/admin/posts/create", "/admin/categories", "/admin/tags", "/admin/pages", "/admin/settings"]:
        response = admin_client.get(path)
        assert response.status_code == 200
        assert "admin" in response.text.lower() or "dashboard" in response.text.lower()


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
