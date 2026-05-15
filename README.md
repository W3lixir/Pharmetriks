# RXaudit

Offline-first pharmacy audit tool for Filipino pharmacy staff. Sold for **₱249 one-time, lifetime access** via manual GCash payment.

## Repository layout

```
vendo/
├── rxaudit-local.html       ← the PWA app (single file, self-contained)
├── manifest.json            ← PWA manifest (also served from portal/public)
├── sw.js                    ← service worker
├── icons/                   ← SVG icon placeholders (replace with real art later)
└── portal/                  ← Next.js 14 wrapper (landing, auth, admin, /app gate)
    ├── app/                 ← App Router pages and route handlers
    │   ├── app/route.ts     ← serves rxaudit-local.html at /app
    │   └── api/verify-license/route.ts
    ├── lib/supabase/        ← server + browser Supabase clients
    ├── public/              ← copies of manifest.json, sw.js, icons/
    └── supabase/
        ├── migrations/0001_init.sql   ← profiles, admins, admin_actions, storage RLS
        └── seed-admin.ts              ← creates the first admin user
```

The HTML at `rxaudit-local.html` is intentionally **never modified** by the portal — only wrapped. All pharmacy data stays in the user's browser (`localStorage`). The portal owns accounts, payment receipts, and license state only.

## Build phases

| #  | Phase                                | Status   |
|----|--------------------------------------|----------|
| 1  | PWA conversion (manifest + SW)       | ✅ done  |
| 2  | Supabase scaffold + Next.js shell    | ✅ done  |
| 3  | Landing page (`/`)                   | pending  |
| 4  | Signup / Login / Receipt upload      | pending  |
| 5  | Admin dashboard (`/admin`)           | pending  |
| 6  | License verification API (real impl) | pending  |
| 7  | PWA install prompts + iOS guide      | pending  |
| 8  | Vercel deploy + production config    | pending  |

## Local development

### 1. Install Node 20+ and create the Supabase project

1. Go to [supabase.com](https://supabase.com) → new project.
2. Region: closest to PH (Singapore).
3. Save the database password somewhere safe — you won't need it for the app, only for the dashboard.

### 2. Apply the schema

In the Supabase dashboard:

- **SQL Editor → New query** → paste the contents of [`portal/supabase/migrations/0001_init.sql`](portal/supabase/migrations/0001_init.sql) → **Run**.
- Verify in **Database → Tables** that `profiles`, `admins`, and `admin_actions` exist.
- Verify in **Storage** that the `receipts` bucket exists (private, 5 MB limit, image MIME types only).

### 3. Configure env vars

```bash
cd portal
cp .env.example .env.local
```

Open `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Settings → API → `anon` key
- `SUPABASE_SERVICE_ROLE_KEY` — Settings → API → `service_role` key (**secret**)
- `SUPABASE_URL` — same as `NEXT_PUBLIC_SUPABASE_URL`

### 4. Seed the admin user

From the `portal/` directory:

```bash
npm install
npm run seed:admin
```

This creates whatever email you set in `ADMIN_EMAIL` as the first admin and prints a one-time password to the terminal. Change it immediately after first login.

### 5. Run the dev server

```bash
cd portal
npm run dev
```

- `http://localhost:3000/` — placeholder landing page (Phase 3 will replace this)
- `http://localhost:3000/app` — the RXaudit PWA, served from `rxaudit-local.html`
- `http://localhost:3000/api/verify-license` — returns a stub for now (always-valid in dev)

The service worker registers on first visit, caches the shell, and serves the app offline thereafter.

## Production deploy (Phase 8 will automate)

- Connect the repo to Vercel.
- Add the env vars from `.env.local` to the Vercel project (Settings → Environment Variables).
- Set the **Root Directory** to `portal/`.
- Default Vercel domain: `rxaudit-portal.vercel.app` (or similar). Custom domain optional.

## Security notes

- **Never commit `.env.local`.** It's gitignored.
- The service-role key has full DB access — only used server-side.
- All client reads/writes are gated by row-level security policies in [`0001_init.sql`](portal/supabase/migrations/0001_init.sql).
- Users can update their own profile but cannot escalate `status` or `license_expires_at` — those are admin-only via the service role.
- Receipts are private; only the uploader and admins can read them.
