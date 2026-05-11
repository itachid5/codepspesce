import re
from uuid import uuid4

from bs4 import BeautifulSoup
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.post import Post
from app.services.post_service import estimate_read_time


def create_taxonomy(admin_client, category_name, tag_name):
    response = admin_client.post("/admin/categories", data={"name": category_name, "description": "Test category"}, follow_redirects=False)
    assert response.status_code == 303
    response = admin_client.post("/admin/tags", data={"name": tag_name}, follow_redirects=False)
    assert response.status_code == 303

    categories_page = admin_client.get("/admin/categories")
    tags_page = admin_client.get("/admin/tags")
    category_match = re.search(rf"<tr><td>{re.escape(category_name)}</td><td>.*?</td><td>.*?</td><td><form method=\"post\" action=\"/admin/categories/(\d+)/delete\"", categories_page.text)
    tag_match = re.search(rf"<tr><td>{re.escape(tag_name)}</td><td>.*?</td><td><form method=\"post\" action=\"/admin/tags/(\d+)/delete\"", tags_page.text)
    assert category_match is not None
    assert tag_match is not None
    return category_match.group(1), tag_match.group(1)


def create_post(admin_client, *, title, slug, category_id, tag_id, summary="A searchable summary for pytest.", content="Detailed FastAPI content for terminal testing."):
    response = admin_client.post(
        "/admin/posts/create",
        data={
            "title": title,
            "slug": slug,
            "summary": summary,
            "content": content,
            "status": "published",
            "category_id": category_id,
            "tag_ids": tag_id,
        },
        follow_redirects=False,
    )
    assert response.status_code == 303


def set_post_metadata(slug, *, featured_image_url="", views_count=0):
    db = SessionLocal()
    try:
        post = db.scalar(select(Post).where(Post.slug == slug))
        assert post is not None
        post.featured_image_url = featured_image_url
        post.views_count = views_count
        db.commit()
    finally:
        db.close()


def test_homepage_and_static_pages_load(client):
    for path in ["/", "/posts", "/categories", "/tags", "/about", "/contact", "/privacy", "/terms", "/search?q=missing"]:
        response = client.get(path)
        assert response.status_code == 200
        assert "Blog" in response.text or "Search" in response.text


def test_read_time_estimate_uses_200_words_per_minute():
    assert estimate_read_time("") == 1
    assert estimate_read_time("word " * 200) == 1
    assert estimate_read_time("word " * 201) == 2


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

    category_id, tag_id = create_taxonomy(admin_client, category_name, tag_name)

    create_post(admin_client, title=post_title, slug=f"testing-fastapi-blog-{suffix}", category_id=category_id, tag_id=tag_id, content="word " * 201)

    search = admin_client.get(f"/search?q={suffix}")
    assert search.status_code == 200
    assert post_title in search.text

    detail = admin_client.get(f"/post/testing-fastapi-blog-{suffix}")
    assert detail.status_code == 200
    assert post_title in detail.text
    assert "views" in detail.text
    assert "2 min read" in detail.text

    category = admin_client.get(f"/category/python-{suffix}")
    tag = admin_client.get(f"/tag/fastapi-{suffix}")
    assert category.status_code == 200
    assert tag.status_code == 200
    assert post_title in category.text
    assert post_title in tag.text

    categories = admin_client.get("/categories")
    tags = admin_client.get("/tags")
    assert categories.status_code == 200
    assert tags.status_code == 200
    assert category_name in categories.text
    assert tag_name in tags.text
    assert "1 post" in categories.text
    assert "1 post" in tags.text


def test_view_counts_featured_images_and_trending(admin_client):
    suffix = uuid4().hex[:8]
    category_id, tag_id = create_taxonomy(admin_client, f"Views {suffix}", f"Images {suffix}")
    low_slug = f"low-views-{suffix}"
    high_slug = f"high-views-{suffix}"
    create_post(admin_client, title=f"Low Views {suffix}", slug=low_slug, category_id=category_id, tag_id=tag_id, summary=f"Low image summary {suffix}")
    create_post(admin_client, title=f"High Views {suffix}", slug=high_slug, category_id=category_id, tag_id=tag_id, summary=f"High image summary {suffix}")
    low_image = f"https://cdn.example.test/{low_slug}.png"
    high_image = f"https://cdn.example.test/{high_slug}.png"
    set_post_metadata(low_slug, featured_image_url=low_image, views_count=1_000_000)
    set_post_metadata(high_slug, featured_image_url=high_image, views_count=1_000_001)

    detail = admin_client.get(f"/post/{high_slug}")
    assert detail.status_code == 200
    assert high_image in detail.text
    assert "1000002 views" in detail.text

    for path in ["/", "/posts", f"/category/views-{suffix}", f"/tag/images-{suffix}", f"/search?q={suffix}"]:
        response = admin_client.get(path)
        assert response.status_code == 200
        assert high_image in response.text
        assert "1000002 views" in response.text

    home_soup = BeautifulSoup(admin_client.get("/").text, "html.parser")
    trending = [item.get_text(" ") for item in home_soup.select(".trend")]
    assert trending
    high_index = next(index for index, text in enumerate(trending) if f"High Views {suffix}" in text)
    low_index = next(index for index, text in enumerate(trending) if f"Low Views {suffix}" in text)
    assert high_index < low_index


def test_all_posts_pagination_homepage_limit_and_related_posts(admin_client):
    suffix = uuid4().hex[:8]
    category_id, tag_id = create_taxonomy(admin_client, f"Archive {suffix}", f"Related {suffix}")
    titles = []
    for index in range(12):
        title = f"Archive Post {index:02d} {suffix}"
        titles.append(title)
        create_post(admin_client, title=title, slug=f"archive-post-{index:02d}-{suffix}", category_id=category_id, tag_id=tag_id, summary=f"Archive summary {index:02d} {suffix}.")

    home = admin_client.get("/")
    assert home.status_code == 200
    assert "View All Posts" in home.text
    home_soup = BeautifulSoup(home.text, "html.parser")
    latest_heading = home_soup.find("h2", string="Latest Posts")
    latest_cards = latest_heading.find_parent().find_next_sibling("div").select("article.post-card")
    assert len(latest_cards) <= 8
    assert latest_cards
    assert all("Published" in card.get_text(" ") for card in latest_cards)
    assert all("min read" in card.get_text(" ") for card in latest_cards)
    header_controls = home_soup.select_one(".header-controls")
    assert header_controls is not None
    assert header_controls.select_one("[data-open-search]") is not None
    assert header_controls.select_one("[data-open-menu]") is not None

    page_one = admin_client.get("/posts")
    assert page_one.status_code == 200
    page_one_soup = BeautifulSoup(page_one.text, "html.parser")
    assert page_one_soup.find("h1", string="All Posts") is not None
    assert len(page_one_soup.select(".list-page article.post-card")) == 10
    assert "Next" in page_one.text

    page_two = admin_client.get("/posts?page=2")
    assert page_two.status_code == 200
    assert "Previous" in page_two.text
    assert any(title in page_two.text for title in titles)

    detail = admin_client.get(f"/post/archive-post-11-{suffix}")
    assert detail.status_code == 200
    assert "Related Posts" in detail.text
    assert any(title in detail.text for title in titles[:11])

    search = admin_client.get(f"/search?q={suffix}")
    assert search.status_code == 200
    assert titles[-1] in search.text
