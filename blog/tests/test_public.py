import re
from uuid import uuid4

from bs4 import BeautifulSoup
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.post import Post
from app.services.post_service import estimate_read_time, published_posts_count, trending_posts


def create_taxonomy(admin_client, category_name, tag_name):
    response = admin_client.post("/admin/categories", data={"name": category_name, "description": "Test category"}, follow_redirects=False)
    assert response.status_code == 303
    response = admin_client.post("/admin/tags", data={"name": tag_name}, follow_redirects=False)
    assert response.status_code == 303

    categories_page = BeautifulSoup(admin_client.get("/admin/categories").text, "html.parser")
    tags_page = BeautifulSoup(admin_client.get("/admin/tags").text, "html.parser")
    category_row = categories_page.find("input", attrs={"name": "name", "value": category_name}).find_parent("tr")
    tag_row = tags_page.find("input", attrs={"name": "name", "value": tag_name}).find_parent("tr")
    category_match = re.search(r"/admin/categories/(\d+)/delete", category_row.decode())
    tag_match = re.search(r"/admin/tags/(\d+)/delete", tag_row.decode())
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
        files={"featured_image": (f"{slug}.png", b"fake image", "image/png")},
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
    assert "1 view" in detail.text
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


def test_homepage_uses_selected_taxonomy(admin_client):
    suffix = uuid4().hex[:8]
    first_category = f"Home Alpha {suffix}"
    second_category = f"Home Beta {suffix}"
    hidden_category = f"Home Hidden {suffix}"
    first_tag = f"Home Tag Alpha {suffix}"
    second_tag = f"Home Tag Beta {suffix}"
    hidden_tag = f"Home Tag Hidden {suffix}"

    admin_client.post("/admin/categories", data={"name": first_category, "description": "First home category", "show_on_home": "true", "home_order": "2"}, follow_redirects=False)
    admin_client.post("/admin/categories", data={"name": second_category, "description": "Second home category", "show_on_home": "true", "home_order": "1"}, follow_redirects=False)
    admin_client.post("/admin/categories", data={"name": hidden_category, "description": "Not selected"}, follow_redirects=False)
    admin_client.post("/admin/tags", data={"name": first_tag, "show_on_home": "true", "home_order": "2"}, follow_redirects=False)
    admin_client.post("/admin/tags", data={"name": second_tag, "show_on_home": "true", "home_order": "1"}, follow_redirects=False)
    admin_client.post("/admin/tags", data={"name": hidden_tag}, follow_redirects=False)

    home = admin_client.get("/")
    assert home.status_code == 200
    soup = BeautifulSoup(home.text, "html.parser")
    categories_section = soup.select_one(".home-categories")
    tags_section = soup.select_one(".home-tags")
    assert categories_section is not None
    assert tags_section is not None
    assert categories_section.select_one('a[href="/categories"]') is not None
    assert tags_section.select_one('a[href="/tags"]') is not None

    category_text = categories_section.get_text(" ")
    tag_text = tags_section.get_text(" ")
    assert first_category in category_text
    assert second_category in category_text
    assert hidden_category not in category_text
    assert first_tag in tag_text
    assert second_tag in tag_text
    assert hidden_tag not in tag_text
    assert category_text.index(second_category) < category_text.index(first_category)
    assert tag_text.index(second_tag) < tag_text.index(first_tag)

    categories = admin_client.get("/categories")
    tags = admin_client.get("/tags")
    assert first_category in categories.text
    assert second_category in categories.text
    assert hidden_category in categories.text
    assert first_tag in tags.text
    assert second_tag in tags.text
    assert hidden_tag in tags.text


def test_homepage_taxonomy_is_separate_from_drawer_menu(admin_client):
    suffix = uuid4().hex[:8]
    home_only_category = f"Home Only Category {suffix}"
    menu_only_category = f"Menu Only Category {suffix}"
    home_only_tag = f"Home Only Tag {suffix}"
    menu_only_tag = f"Menu Only Tag {suffix}"

    admin_client.post("/admin/categories", data={"name": home_only_category, "description": "Home", "show_on_home": "true", "home_order": "1"}, follow_redirects=False)
    admin_client.post("/admin/categories", data={"name": menu_only_category, "description": "Menu", "show_in_menu": "true", "menu_order": "1"}, follow_redirects=False)
    admin_client.post("/admin/tags", data={"name": home_only_tag, "show_on_home": "true", "home_order": "1"}, follow_redirects=False)
    admin_client.post("/admin/tags", data={"name": menu_only_tag, "show_in_menu": "true", "menu_order": "1"}, follow_redirects=False)

    soup = BeautifulSoup(admin_client.get("/").text, "html.parser")
    drawer_text = soup.select_one("#drawer").get_text(" ")
    home_category_text = soup.select_one(".home-categories").get_text(" ")
    home_tag_text = soup.select_one(".home-tags").get_text(" ")

    assert home_only_category in home_category_text
    assert menu_only_category not in home_category_text
    assert home_only_tag in home_tag_text
    assert menu_only_tag not in home_tag_text
    assert menu_only_category in drawer_text
    assert menu_only_tag in drawer_text
    assert home_only_category not in drawer_text
    assert home_only_tag not in drawer_text


def test_drawer_uses_selected_menu_taxonomy(admin_client):
    suffix = uuid4().hex[:8]
    shown_category = f"Shown Category {suffix}"
    hidden_category = f"Hidden Category {suffix}"
    shown_tag = f"Shown Tag {suffix}"
    hidden_tag = f"Hidden Tag {suffix}"
    admin_client.post("/admin/categories", data={"name": shown_category, "description": "Visible", "show_in_menu": "true", "menu_order": "1"}, follow_redirects=False)
    admin_client.post("/admin/categories", data={"name": hidden_category, "description": "Hidden"}, follow_redirects=False)
    admin_client.post("/admin/tags", data={"name": shown_tag, "show_in_menu": "true", "menu_order": "1"}, follow_redirects=False)
    admin_client.post("/admin/tags", data={"name": hidden_tag}, follow_redirects=False)

    home = admin_client.get("/")
    assert home.status_code == 200
    soup = BeautifulSoup(home.text, "html.parser")
    drawer = soup.select_one("#drawer")
    assert drawer is not None
    assert shown_category in drawer.get_text(" ")
    assert shown_tag in drawer.get_text(" ")
    assert hidden_category not in drawer.get_text(" ")
    assert hidden_tag not in drawer.get_text(" ")
    assert drawer.select_one("[data-drawer-toggle]") is not None
    assert soup.select_one("[data-theme-toggle]") is not None

    categories = admin_client.get("/categories")
    tags = admin_client.get("/tags")
    assert shown_category in categories.text
    assert hidden_category in categories.text
    assert shown_tag in tags.text
    assert hidden_tag in tags.text


def test_public_pages_exclude_published_posts_without_featured_images(admin_client):
    suffix = uuid4().hex[:8]
    category_id, tag_id = create_taxonomy(admin_client, f"Image Filter {suffix}", f"Visible Tag {suffix}")
    top_slug = f"image-backed-top-{suffix}"
    low_slug = f"image-backed-low-{suffix}"
    imageless_slug = f"imageless-top-{suffix}"
    top_title = f"Image Backed Top {suffix}"
    low_title = f"Image Backed Low {suffix}"
    imageless_title = f"Imageless Top {suffix}"

    create_post(admin_client, title=top_title, slug=top_slug, category_id=category_id, tag_id=tag_id, summary=f"Visible top summary {suffix}")
    create_post(admin_client, title=low_title, slug=low_slug, category_id=category_id, tag_id=tag_id, summary=f"Visible low summary {suffix}")
    create_post(admin_client, title=imageless_title, slug=imageless_slug, category_id=category_id, tag_id=tag_id, summary=f"Hidden imageless summary {suffix}")
    top_image = f"https://cdn.example.test/{top_slug}.png"
    low_image = f"https://cdn.example.test/{low_slug}.png"
    set_post_metadata(top_slug, featured_image_url=top_image, views_count=2_100_000_001)
    set_post_metadata(low_slug, featured_image_url=low_image, views_count=2_100_000_000)
    set_post_metadata(imageless_slug, featured_image_url="", views_count=2_100_000_002)

    for path in ["/", "/posts", f"/category/image-filter-{suffix}", f"/tag/visible-tag-{suffix}", f"/search?q={suffix}"]:
        response = admin_client.get(path)
        assert response.status_code == 200
        assert imageless_title not in response.text
        assert top_title in response.text
        assert top_image in response.text

    detail = admin_client.get(f"/post/{top_slug}")
    assert detail.status_code == 200
    assert imageless_title not in detail.text
    assert low_title in detail.text
    assert low_image in detail.text

    hidden_detail = admin_client.get(f"/post/{imageless_slug}")
    assert hidden_detail.status_code == 404

    db = SessionLocal()
    try:
        matching_titles = [post.title for post in trending_posts(db, limit=1000) if suffix in post.title]
    finally:
        db.close()
    assert imageless_title not in matching_titles
    assert matching_titles.index(top_title) < matching_titles.index(low_title)


def test_published_posts_count_excludes_imageless_posts(admin_client):
    suffix = uuid4().hex[:8]
    category_id, tag_id = create_taxonomy(admin_client, f"Count Category {suffix}", f"Count Tag {suffix}")
    db = SessionLocal()
    try:
        count_before = published_posts_count(db)
    finally:
        db.close()

    slug = f"count-visible-{suffix}"
    create_post(admin_client, title=f"Count Visible {suffix}", slug=slug, category_id=category_id, tag_id=tag_id)

    db = SessionLocal()
    try:
        imageless = Post(title=f"Count Imageless {suffix}", slug=f"count-imageless-{suffix}", summary="Hidden.", content="Hidden content.", status="published", featured_image_url="")
        db.add(imageless)
        db.commit()
    finally:
        db.close()

    db = SessionLocal()
    try:
        count_after = published_posts_count(db)
    finally:
        db.close()
    assert count_after == count_before + 1


def test_view_counts_featured_images_and_trending(admin_client):
    suffix = uuid4().hex[:8]
    category_id, tag_id = create_taxonomy(admin_client, f"Views {suffix}", f"Images {suffix}")
    low_slug = f"low-views-{suffix}"
    high_slug = f"high-views-{suffix}"
    create_post(admin_client, title=f"Low Views {suffix}", slug=low_slug, category_id=category_id, tag_id=tag_id, summary=f"Low image summary {suffix}")
    create_post(admin_client, title=f"High Views {suffix}", slug=high_slug, category_id=category_id, tag_id=tag_id, summary=f"High image summary {suffix}")
    low_image = f"https://cdn.example.test/{low_slug}.png"
    high_image = f"https://cdn.example.test/{high_slug}.png"
    set_post_metadata(low_slug, featured_image_url=low_image, views_count=1_999_999_998)
    set_post_metadata(high_slug, featured_image_url=high_image, views_count=1_999_999_999)

    detail = admin_client.get(f"/post/{high_slug}")
    assert detail.status_code == 200
    assert high_image in detail.text
    assert "2b views" in detail.text
    assert "2000000000 views" not in detail.text

    for path in ["/", "/posts", f"/category/views-{suffix}", f"/tag/images-{suffix}", f"/search?q={suffix}"]:
        response = admin_client.get(path)
        assert response.status_code == 200
        assert high_image in response.text
        assert "2b views" in response.text
        assert "2000000000 views" not in response.text

    db = SessionLocal()
    try:
        trending_titles = [post.title for post in trending_posts(db, limit=1000) if suffix in post.title]
    finally:
        db.close()
    high_index = next(index for index, title in enumerate(trending_titles) if f"High Views {suffix}" in title)
    low_index = next(index for index, title in enumerate(trending_titles) if f"Low Views {suffix}" in title)
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
