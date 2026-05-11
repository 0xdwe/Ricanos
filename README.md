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

4. Run development server:

   ```bash
   npm run dev
   ```

## Verification

```bash
npm test
npm run typecheck
npm run build
```

## Product docs

- PRD: `docs/prd-padel-community-platform.md`
- Proposed issues: `docs/issues/proposed-issues.md`
```
