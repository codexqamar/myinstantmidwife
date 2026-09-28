# My Instant Midwife Dashboard

Standalone admin dashboard for managing editable website content, pricing, and images.

## Run locally

```bash
cd dashboard
copy .env.example .env
npm start
```

Open `http://localhost:3100`.

## Production

Set these environment variables on the subdomain deployment:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `PORT`

Public content feed:

```text
GET /api/public-content
```

Uploads are stored in `uploads/`. Content is stored in `data/content.json`. Existing website files are not modified by this dashboard.
