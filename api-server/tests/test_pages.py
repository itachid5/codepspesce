def test_home_page(client):
    response = client.get("/")

    assert response.status_code == 200
    assert "API Server" in response.text
    assert "Cloudinary Media Upload API" in response.text


def test_cloudinary_docs_page(client):
    response = client.get("/docs/cloudinary")

    assert response.status_code == 200
    assert "POST /api/cloudinary/upload" in response.text
    assert "Try it in the browser" in response.text


def test_legacy_cloudinary_docs_page(client):
    response = client.get("/cloudinary")

    assert response.status_code == 200
    assert "POST /api/cloudinary/upload" in response.text


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "API Server"
    assert "environment" in response.json()


def test_fastapi_docs_are_available(client):
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200
