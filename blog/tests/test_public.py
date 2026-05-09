from uuid import uuid4


def test_homepage_and_static_pages_load(client):
    for path in ["/", "/about", "/contact", "/privacy", "/terms", "/search?q=missing"]:
        response = client.get(path)
        assert response.status_code == 200
        assert "Blog" in response.text or "Search" in response.text


def test_admin_login_and_protection(client):
    protected = client.get("/admin/dashboard", follow_redirects=False)
    assert protected.status_code == 303
    assert protected.headers["location"] == "/admin/login"

    login = client.post("/admin/login", data={"username": "admin", "password": "change-this-password"}, follow_redirects=False)
    assert login.status_code == 303
    assert login.headers["location"] == "/admin/dashboard"


def test_create_taxonomy_post_search_and_detail(admin_client):
    suffix = uuid4().hex[:8]
    category_name = f"Python {suffix}"
    tag_name = f"FastAPI {suffix}"
    post_title = f"Testing FastAPI Blog {suffix}"

    response = admin_client.post("/admin/categories", data={"name": category_name, "description": "Python category"}, follow_redirects=False)
    assert response.status_code == 303
    response = admin_client.post("/admin/tags", data={"name": tag_name}, follow_redirects=False)
    assert response.status_code == 303

    categories_page = admin_client.get("/admin/categories")
    tags_page = admin_client.get("/admin/tags")
    assert category_name in categories_page.text
    assert tag_name in tags_page.text

    import re
    category_match = re.search(rf"<tr><td>{re.escape(category_name)}</td><td>.*?</td><td>.*?</td><td><form method=\"post\" action=\"/admin/categories/(\d+)/delete\"", categories_page.text)
    tag_match = re.search(rf"<tr><td>{re.escape(tag_name)}</td><td>.*?</td><td><form method=\"post\" action=\"/admin/tags/(\d+)/delete\"", tags_page.text)
    assert category_match is not None
    assert tag_match is not None
    category_id = category_match.group(1)
    tag_id = tag_match.group(1)

    response = admin_client.post(
        "/admin/posts/create",
        data={
            "title": post_title,
            "slug": f"testing-fastapi-blog-{suffix}",
            "summary": "A searchable summary for pytest.",
            "content": "Detailed FastAPI content for terminal testing.",
            "status": "published",
            "category_id": category_id,
            "tag_ids": tag_id,
            "is_featured": "true",
        },
        follow_redirects=False,
    )
    assert response.status_code == 303

    search = admin_client.get(f"/search?q={suffix}")
    assert search.status_code == 200
    assert post_title in search.text

    detail = admin_client.get(f"/post/testing-fastapi-blog-{suffix}")
    assert detail.status_code == 200
    assert post_title in detail.text
    assert "views" in detail.text

    category = admin_client.get(f"/category/python-{suffix}")
    tag = admin_client.get(f"/tag/fastapi-{suffix}")
    assert category.status_code == 200
    assert tag.status_code == 200
    assert post_title in category.text
    assert post_title in tag.text
