# API Server

API Server is a modular Python FastAPI website and API server with Cloudinary media uploads, HTML documentation pages, static assets, environment-based configuration, and tests.

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
requirements.txt
render.yaml
Procfile
.env.example
```

## Local setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Activate it on macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your local environment file:

```bash
cp .env.example .env
```

Fill in `.env` with your local values:

```env
APP_NAME=API Server
APP_ENV=development
PORT=8000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

MAX_UPLOAD_SIZE_MB=50
```

Do not commit real secrets.

## Run locally

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Local URLs

- Home: `http://localhost:8000/`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Cloudinary docs: `http://localhost:8000/docs/cloudinary`
- Legacy Cloudinary docs alias: `http://localhost:8000/cloudinary`
- Health check: `http://localhost:8000/health`

## Render deployment

### Option 1: Manual Web Service setup

1. Push this project to GitHub.
2. Go to Render.com.
3. Create a new Web Service.
4. Connect your GitHub repository.
5. Set Environment to `Python`.
6. Set Build Command:

```bash
pip install -r requirements.txt
```

7. Set Start Command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

8. Add environment variables in the Render dashboard:

```env
APP_NAME=API Server
APP_ENV=production
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Render automatically provides `PORT`, so you do not need to add it manually.

9. Deploy.

### Option 2: Render Blueprint

This project includes `render.yaml`, so you can also deploy it as a Render Blueprint. The Blueprint uses:

```bash
pip install -r requirements.txt
```

as the build command and:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

as the start command.

You still need to add the Cloudinary secret values in Render.

## Render URLs

After deployment, replace `your-render-app` with your Render service name:

- Home: `https://your-render-app.onrender.com/`
- Swagger docs: `https://your-render-app.onrender.com/docs`
- ReDoc: `https://your-render-app.onrender.com/redoc`
- Cloudinary docs: `https://your-render-app.onrender.com/docs/cloudinary`
- Legacy Cloudinary docs alias: `https://your-render-app.onrender.com/cloudinary`
- Health check: `https://your-render-app.onrender.com/health`

## Health check

Endpoint:

```text
GET /health
```

Example response:

```json
{
  "status": "ok",
  "service": "API Server",
  "environment": "production"
}
```

## Cloudinary upload API

Endpoint:

```text
POST /api/cloudinary/upload
```

Form field:

```text
file
```

Example Render curl:

```bash
curl -X POST "https://your-render-app.onrender.com/api/cloudinary/upload" \
  -F "file=@example.jpg"
```

Example local curl:

```bash
curl -X POST "http://localhost:8000/api/cloudinary/upload" \
  -F "file=@example.jpg"
```

Expected success response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "secure_url": "https://res.cloudinary.com/...",
    "public_id": "example_public_id",
    "resource_type": "image",
    "format": "jpg",
    "bytes": 123456,
    "original_filename": "example"
  }
}
```

If Cloudinary credentials are missing, the upload endpoint returns:

```json
{
  "success": false,
  "message": "Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
}
```

The browser upload form on `/docs/cloudinary` uses the relative URL `/api/cloudinary/upload`, so it works locally and on Render.

## Run tests

```bash
pytest
```

The automated tests mock Cloudinary uploads so they can run without making real network requests. Use the browser form or curl with real `.env` values for a live Cloudinary upload test.
