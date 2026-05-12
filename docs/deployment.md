# Deployment: Vercel + Supabase

Ricanos deploys as a Next.js App Router app on Vercel with Supabase Postgres/Auth. MVP is admin-authenticated management plus public view-only event dashboards. There is no player login and no realtime subscription requirement; public pages use manual refresh and lightweight auto-refresh.

## Required environment variables

Set these in `.env.local` for development and in Vercel Project Settings → Environment Variables for Production/Preview as needed.

| Variable | Required | Where to get it | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Project Settings → API → Project URL | Safe to expose to browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Project Settings → API → anon public key | Used by Supabase SSR auth client. |
| `DATABASE_URL` | Yes | Supabase Project Settings → Database → Connection string | Used by Drizzle and server-side DB access. Include password and `sslmode=require` when Supabase requires SSL. |

Do not add Supabase service-role keys unless a future issue explicitly needs them.

## Supabase setup

1. Create a Supabase project.
2. Copy the Project URL and anon public key into the env vars above.
3. Copy a Postgres connection string into `DATABASE_URL`.
   - Use a connection string that works from your local machine/CI for migrations.
   - If using Supabase pooler, keep the exact host/port format Supabase provides and add the database password.
4. Prepare Supabase Auth for admins.
   - Create admin users in Supabase Auth.
   - Set Site URL to the deployed Vercel URL.
   - Add redirect URLs for local and deployed admin paths, e.g. `http://localhost:3000/**` and `https://<your-app>.vercel.app/**`.
   - Current limitation: the app middleware protects `/admin`, but the `/admin/login` UI is still a placeholder. Admin sign-in must be completed in a future issue or seeded through an existing Supabase SSR session before authenticated admin smoke testing is possible.
5. Apply database migrations:

   ```bash
   npm run db:migrate
   ```

Migrations live in `drizzle/` and are generated from `src/lib/db/schema.ts`.

## Local production check

From a clean checkout:

```bash
npm install
cp .env.example .env.local
# fill .env.local with Supabase values
npm run db:migrate
npm test
npm run typecheck
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key DATABASE_URL=postgres://user:pass@localhost:5432/ricanos npm run build
```

The example build command verifies that required env vars are wired. Use real Supabase values for a meaningful deployed smoke test.

## Vercel deployment path

1. Push the repo to GitHub.
2. In Vercel, import the GitHub repository.
3. Use defaults:
   - Framework Preset: Next.js
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: default
4. Add the three required env vars in Vercel.
5. Run `npm run db:migrate` against the target Supabase database before promoting a deployment that depends on new schema.
6. Deploy.
7. Smoke test:
   - `/` loads.
   - `/events/<public-slug>` loads without login and remains view-only.
   - `/admin` redirects unauthenticated users to `/admin/login`.
   - Admin login page loads and shows the current placeholder state.
   - Authenticated admin event-page smoke testing is blocked until the admin login UI is connected or an admin session is seeded outside the app.

## Troubleshooting

- `Missing required environment variable: ...`: set all three required env vars in the current shell, `.env.local`, or Vercel environment.
- Vercel build fails during DB access: confirm `DATABASE_URL` is set for the Vercel environment and allows connections from Vercel/Supabase pooler.
- Next.js warns that it inferred the workspace root or found multiple lockfiles: common in local git worktrees. Vercel should build from the repo root; investigate only if Vercel selects the wrong root.
- Next.js warns that `middleware` is deprecated in favor of `proxy`: known framework warning in current Next version; auth routing still builds and runs.
- `npm run lint` fails with `next lint` unavailable/deprecated: this project currently validates with `npm test`, `npm run typecheck`, and `npm run build` until the lint script is modernized.
- No live updates appear on public dashboards: expected for MVP. Use refresh/manual polling; realtime is out of scope.
- Players cannot log in: expected for MVP. Only admins authenticate.
- Admin login form is not connected yet: expected current limitation. Middleware is in place, but interactive admin sign-in remains future production work.
