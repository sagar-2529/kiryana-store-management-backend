# Deploying Kiryana Store API

## Local setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The API is then available at `http://localhost:3000`; check it with
`GET /health`. Register the first owner with `POST /api/v1/auth/register`, log
in, and send the returned token in `Authorization: Bearer <token>` for all
store-management endpoints. Registration is bootstrap-only: after the first
owner exists, the endpoint returns `401` to prevent public account creation.

## Render + Neon

1. Create a PostgreSQL database on Neon and copy its connection string.
2. In Render, create a Blueprint from this GitHub repository. It reads
   `render.yaml` automatically.
3. Set `DATABASE_URL` to the Neon connection string. Keep it secret.
4. Before the first release, run `npx prisma migrate deploy` once with that
   production `DATABASE_URL`. This creates the database tables.
5. Deploy. Render checks `/health` and exposes the API at its `onrender.com`
   URL.

`/api/v1/auth/register` is intentionally public only for first-time setup and
automatically closes once it creates the first owner account.
