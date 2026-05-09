def test_home_page(client):
    response = client.get("/")

    assert response.status_code == 200
    assert "API Server" in response.text
    assert "Cloudinary Media Upload API" in response.text


def test_cloudinary_docs_page(client):
    response = client.get("/cloudinary")

    assert response.status_code == 200
    assert "POST /api/cloudinary/upload" in response.text
    assert "Try it in the browser" in response.text


def test_fastapi_docs_are_available(client):
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200
