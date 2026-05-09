# Tools Web

A Flask website for online tools such as social video downloaders, Facebook downloader pages, AI tools, and everyday utilities.

## Run locally

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open `http://localhost:5000`.

## Render deployment

This project includes `render.yaml`. On Render, use:

- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
