# Vercel deploy

## Prerequisites

- GitHub repo connected to Vercel
- Neon PostgreSQL database with menu data and snapshots
- Cloudflare R2 bucket with menu images

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables.
Apply to **Production**, **Preview**, and **Build** (build needs `DATABASE_URL` for menu SSG/ISR).

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Yes | R2 API token (read access to `menu-items/*`) |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API token secret |
| `R2_BUCKET_NAME` | Yes | Bucket name |
| `R2_PUBLIC_URL` | Optional | Custom public R2 domain for `next/image` remote patterns |
| `NEXT_PUBLIC_APP_URL` | Optional | Production site URL, e.g. `https://menu.example.com` |

Do not commit `.env`. Use `.env.example` as the reference list.

## Vercel project settings

Vercel auto-detects Next.js. Defaults are fine:

- **Install command:** `pnpm install`
- **Build command:** `pnpm build`
- **Output:** Next.js (automatic)

`postinstall` runs `prisma generate` so the Prisma client is available during build.

## Database

Schema is defined in `prisma/schema.prisma`. Apply to Neon before first deploy:

```bash
pnpm db:push
pnpm db:seed
node scripts/rebuild-menu-snapshots.mjs
```

For production schema changes, prefer Prisma migrations over `db push`.

## Local pre-deploy check

```bash
pnpm check
```

Runs: `typecheck` → `lint` → `test` → `build`.

## After deploy

1. Open `/hy`, `/ru`, `/en` and verify menu content and images.
2. Confirm `/api/r2/image?key=menu-items/...` returns images (not 403).
3. Update menu data via scripts, then wait up to 5 minutes for ISR revalidation (or trigger a redeploy).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Demo menu on production | `DATABASE_URL` missing at **build** time |
| Images 500 | R2 env vars missing or invalid |
| Images 403 | Key not under `menu-items/` or unsupported extension |
| Prisma engine error on Vercel | Run `pnpm prisma:generate` locally and commit lockfile; schema includes `rhel-openssl-3.0.x` binary target |
