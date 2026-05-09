# API Server

A modular Python FastAPI website and API server for managing multiple APIs from one place.

## What is included

- FastAPI app with built-in `/docs` and `/redoc`
- Jinja2 website pages
- Static CSS and JavaScript assets
- Modular API folder structure
- Cloudinary media upload API
- Environment-based configuration
- Pytest test suite

## Project structure

```text
app/
  main.py
  core/
    config.py
    cloudinary.py
  api/
    router.py
    cloudinary/
      routes.py
      service.py
      schemas.py
  web/
    routes.py
  templates/
    base.html
    index.html
    cloudinary.html
  static/
    css/style.css
    js/cloudinary.js
  utils/
    file_validation.py
    responses.py
tests/
  conftest.py
  test_pages.py
  test_cloudinary_api.py
```

Future APIs can be added as isolated modules under `app/api/new_api_name/` with their own `routes.py`, `service.py`, `schemas.py`, and documentation page.

## Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -e .
```

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Fill in your Cloudinary values:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=8000
APP_NAME=API Server
APP_ENV=development
MAX_UPLOAD_SIZE_MB=50
```

Do not commit `.env`.

## Run the server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Website pages

- Home page: `http://127.0.0.1:8000/`
- Cloudinary docs and browser upload form: `http://127.0.0.1:8000/cloudinary`
- Swagger docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Cloudinary upload API

Endpoint:

```text
POST /api/cloudinary/upload
```

Request type:

```text
multipart/form-data
```

Required field:

```text
file
```

Example curl request:

```bash
curl -X POST "http://127.0.0.1:8000/api/cloudinary/upload" \
  -F "file=@/path/to/example.jpg"
```

Example success response:

```json
{
  "secure_url": "https://res.cloudinary.com/example/image/upload/v123/example.jpg",
  "public_id": "example",
  "resource_type": "image",
  "format": "jpg",
  "bytes": 12345,
  "original_filename": "example",
  "asset_id": "abc123",
  "width": 1200,
  "height": 800
}
```

Supported upload categories include images, videos, audio files, PDFs, text files, CSV/JSON files, ZIP files, and common Office documents.

## Run tests

```bash
pytest
```

The automated tests mock Cloudinary uploads so they can run without making real network requests. Use the browser form or curl with real `.env` values for a live Cloudinary upload test.
