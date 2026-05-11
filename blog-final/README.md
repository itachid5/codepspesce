# The Signal Ledger

A production-ready Next.js blog/news publishing platform with a public editorial website, protected admin dashboard, Prisma database, read-time calculation, view analytics, trending posts, related posts, SEO metadata, and image upload through the required Media API.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite locally via `DATABASE_URL` with production-ready environment configuration

## Environment

Copy `.env.example` to `.env` and update values:

```bash
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me-now"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
MEDIA_API_URL="https://bot-api-j75j.onrender.com/api/cloudinary/upload"
```

## Setup

```bash
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Open `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the dashboard.

Default seeded admin credentials use `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

## Media upload flow

The admin image uploader sends selected files to:

```text
POST https://bot-api-j75j.onrender.com/api/cloudinary/upload
Content-Type: multipart/form-data
field: file
```

The returned `secure_url` is saved as `featuredImageUrl` and rendered with `next/image`. The app never uploads directly to Cloudinary.

## Features

- Homepage with featured, latest, category filter, search, and trending posts
- Blog listing, category pages, tag pages, search, and article pages
- Dynamic SEO metadata, canonical URLs, and Open Graph images
- Protected admin login and dashboard
- Create, edit, delete posts
- Draft/published workflow
- Category and tag management
- Featured image upload and preview
- Automatic read-time calculation at 200 words per minute
- View-count API with visitor-cookie dedupe over 24 hours
- Trending posts from recent daily metrics with fallback to total views
- Related posts by category and shared tags

## Validation

```bash
npm run lint
npm run build
```
