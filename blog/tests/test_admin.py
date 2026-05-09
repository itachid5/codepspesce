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
