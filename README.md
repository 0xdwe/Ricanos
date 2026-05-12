# Ricanos

Ricanos is a mobile-first padel community event manager for Americano and Mexicano formats.

## Stack

- Next.js App Router
- TypeScript
- Supabase Auth/Postgres
- Drizzle ORM
- Tailwind CSS
- Vitest

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in Supabase and database values in `.env.local`.

4. Apply database migrations when using a fresh Supabase database:

   ```bash
   npm run db:migrate
   ```

5. Run development server:

   ```bash
   npm run dev
   ```

## Verification

```bash
npm test
npm run typecheck
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key DATABASE_URL=postgres://user:pass@localhost:5432/ricanos npm run build
```

## Deployment

See `docs/deployment.md` for Vercel + Supabase setup, required environment variables, migrations, smoke tests, and troubleshooting.

## Product docs

- Deployment: `docs/deployment.md`
- PRD: `docs/prd-padel-community-platform.md`
- Proposed issues: `docs/issues/proposed-issues.md`
- Player directory and roster plan: `docs/superpowers/plans/2026-05-11-player-directory-and-rosters.md`
- Fixed-team registration plan: `docs/superpowers/plans/2026-05-11-fixed-team-registration.md`
- Leaderboard engine plan: `docs/superpowers/plans/2026-05-11-leaderboard-engine.md`
- Americano schedule preview plan: `docs/superpowers/plans/2026-05-11-americano-schedule-preview.md`
- Fixed-team round-robin plan: `docs/superpowers/plans/2026-05-11-fixed-team-round-robin.md`
- Mexicano individual rounds plan: `docs/superpowers/plans/2026-05-11-mexicano-individual-rounds.md`
- Mexicano fixed-team rounds plan: `docs/superpowers/plans/2026-05-11-mexicano-fixed-team-rounds.md`
- Byes and rest selection plan: `docs/superpowers/plans/2026-05-11-byes-rest-selection.md`
