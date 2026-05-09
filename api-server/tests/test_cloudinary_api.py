from app.core.cloudinary import CLOUDINARY_MISSING_CONFIG_MESSAGE, CloudinaryConfigurationError


def test_cloudinary_upload_success(client, monkeypatch):
    def fake_configure_cloudinary(*args, **kwargs):
        return None

    def fake_upload(*args, **kwargs):
        return {
            "secure_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            "public_id": "sample",
            "resource_type": "image",
            "format": "jpg",
            "bytes": 12,
            "original_filename": "sample",
            "asset_id": "asset-123",
            "width": 100,
            "height": 80,
        }

    monkeypatch.setattr("app.api.cloudinary.service.configure_cloudinary", fake_configure_cloudinary)
    monkeypatch.setattr("app.api.cloudinary.service.uploader.upload", fake_upload)

    response = client.post(
        "/api/cloudinary/upload",
        files={"file": ("sample.jpg", b"fake image", "image/jpeg")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["message"] == "File uploaded successfully"
    assert payload["data"]["secure_url"] == "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    assert payload["data"]["public_id"] == "sample"
    assert payload["data"]["resource_type"] == "image"
    assert payload["data"]["format"] == "jpg"
    assert payload["data"]["bytes"] == 12
    assert payload["data"]["original_filename"] == "sample"


def test_cloudinary_upload_requires_file(client):
    response = client.post("/api/cloudinary/upload")

    assert response.status_code == 422


def test_cloudinary_upload_rejects_unsupported_content_type(client):
    response = client.post(
        "/api/cloudinary/upload",
        files={"file": ("program.exe", b"not allowed", "application/x-msdownload")},
    )

    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_cloudinary_upload_rejects_empty_file(client):
    response = client.post(
        "/api/cloudinary/upload",
        files={"file": ("empty.txt", b"", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Uploaded file cannot be empty."


def test_cloudinary_upload_reports_missing_configuration(client, monkeypatch):
    def fake_configure_cloudinary(*args, **kwargs):
        raise CloudinaryConfigurationError(CLOUDINARY_MISSING_CONFIG_MESSAGE)

    monkeypatch.setattr("app.api.cloudinary.service.configure_cloudinary", fake_configure_cloudinary)

    response = client.post(
        "/api/cloudinary/upload",
        files={"file": ("sample.jpg", b"fake image", "image/jpeg")},
    )

    assert response.status_code == 503
    assert response.json() == {"success": False, "message": CLOUDINARY_MISSING_CONFIG_MESSAGE}


def test_cloudinary_upload_handles_provider_error(client, monkeypatch):
    def fake_configure_cloudinary(*args, **kwargs):
        return None

    def fake_upload(*args, **kwargs):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr("app.api.cloudinary.service.configure_cloudinary", fake_configure_cloudinary)
    monkeypatch.setattr("app.api.cloudinary.service.uploader.upload", fake_upload)

    response = client.post(
        "/api/cloudinary/upload",
        files={"file": ("sample.jpg", b"fake image", "image/jpeg")},
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "Cloudinary upload failed. Please verify configuration and try again."
