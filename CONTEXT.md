# Code Context

## Files Retrieved
1. `package.json` (lines 1-42) - scripts and dependencies: Next/React, Supabase, Drizzle, postgres, Tailwind, Vitest.
2. `README.md` (lines 1-55) - repo purpose, stack, setup, verification, product-doc links.
3. `docs/prd-padel-community-platform.md` (lines 1-199) - product scope, UX expectations, MVP constraints, realtime/refresh decision, out-of-scope items.
4. `src/lib/db/schema.ts` (lines 1-111) - canonical Postgres schema/enums for events, courts, players, rosters, teams, rounds, matches, audit log.
5. `src/lib/env.ts` (lines 1-23) and `src/lib/db/index.ts` (lines 1-9) - required env vars and Drizzle/postgres connection.
6. `src/lib/supabase/middleware.ts` (lines 1-24) and `src/middleware.ts` (lines 1-20) - Supabase SSR session refresh and `/admin` route protection.
7. `src/app/admin/page.tsx` (lines 1-27), `src/app/admin/login/page.tsx` (lines 1-13), `src/app/admin/events/new/page.tsx` (lines 1-60), `src/app/events/[slug]/page.tsx` (lines 1-33) - current UI shells and public dashboard shell.
8. `src/app/admin/events/[eventId]/scores/page.tsx` (lines 1-144) - main wired server-action UI for score/status updates.
9. `src/features/events/event-model.ts` (lines 1-120) and `src/features/events/drizzle-event-store.ts` (lines 1-71) - event validation, slug/status logic, DB-backed event store.
10. `src/features/players/player-model.ts` (lines 1-44), `src/features/players/player-actions.ts` (lines 1-46), `src/features/players/drizzle-player-store.ts` (lines 1-40) - reusable player directory and event roster logic.
11. `src/features/teams/team-model.ts` (lines 1-42), `src/features/teams/team-actions.ts` (lines 1-36), `src/features/teams/drizzle-team-store.ts` (lines 1-49) - fixed-team parsing/registration and DB store.
12. `src/features/matches/match-actions.ts` (lines 1-106) and `src/features/matches/drizzle-match-store.ts` (lines 1-59) - score/status mutations, Mexicano correction, audit integration, match DB store.
13. `src/features/leaderboards/leaderboard-engine.ts` (lines 1-99) - pure leaderboard ranking engine.
14. `src/features/schedules/americano-scheduler.ts` (lines 1-62), `src/features/schedules/mexicano-individual-scheduler.ts` (lines 1-46), `src/features/schedules/team-round-robin-scheduler.ts` (lines 1-51), `src/features/schedules/active-selection.ts` (lines 1-45) - pure scheduling and fair-bye logic.
15. `src/features/risk/risk-validation.ts` (lines 1-106) - warnings/confirmation for risky admin edits.

## Key Code

**Stack and runtime**
- Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Drizzle ORM, Vitest (`package.json` lines 5-40; `README.md` lines 5-12).
- Required env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` (`src/lib/env.ts` lines 3-22).
- DB client: `postgres(databaseUrl, { prepare: false })` wrapped by Drizzle with `schema` (`src/lib/db/index.ts` lines 6-8).

**Data model**
- Event-level enums: `event_status` = draft/ready/live/completed/archived, `event_format` = americano/mexicano, `pairing_mode` = individual/fixed_team (`src/lib/db/schema.ts` lines 3-6).
- `events` stores public slug, lifecycle, format/mode, court count, score target, round count, optional auto refresh, and `scheduleGenerated` (`src/lib/db/schema.ts` lines 19-37).
- Player directory is separate from event roster: `players.normalizedName` is unique, `event_players` links players to events with sort order (`src/lib/db/schema.ts` lines 46-60).
- Fixed teams use `teams` plus `team_players` (`src/lib/db/schema.ts` lines 62-76).
- Matches store round/court, status, participant ID arrays as JSONB, scores, target, override warning, and abandoned-counts flag (`src/lib/db/schema.ts` lines 85-100).
- Audit log records action type, actor, event, entity, summary, timestamp (`src/lib/db/schema.ts` lines 102-111).

**Auth**
- Middleware refreshes Supabase SSR session then redirects unauthenticated `/admin/*` traffic to `/admin/login`, except login page (`src/middleware.ts` lines 4-13).
- Login page is only placeholder text; no email login form yet (`src/app/admin/login/page.tsx` lines 1-13).

**Implemented domain features**
- Event creation validation for name, format, pairing mode, positive court/score/round values; public slug is name + random hex seed (`src/features/events/event-model.ts` lines 57-103; `src/features/events/event-actions.ts` lines 1-21).
- Event lifecycle transitions are encoded: draft→ready/archive, ready→live/draft/archive, live→completed, completed→live/archive, archived→draft (`src/features/events/event-model.ts` lines 106-119).
- Event store creates default courts `Court 1..N` when creating an event (`src/features/events/drizzle-event-store.ts` lines 39-48).
- Player imports normalize names by trimming, removing diacritics, collapsing whitespace, lowercasing, and deduping multiline input (`src/features/players/player-model.ts` lines 10-33). Actions create-or-reuse players and prevent duplicate roster adds (`src/features/players/player-actions.ts` lines 12-46).
- Fixed-team import expects `Alice / Bob`, creates/reuses player records, rejects same-player team (`src/features/teams/team-model.ts` lines 18-42; `src/features/teams/team-actions.ts` lines 21-36).
- Score entry server action is wired to real Drizzle stores. It loads match/event, validates risk, scores completed matches, handles Mexicano correction choice, or updates match status/abandoned flag (`src/app/admin/events/[eventId]/scores/page.tsx` lines 16-55).
- Score logic validates non-negative integer scores and fixed target sum unless override is confirmed; saved score sets match completed and writes audit entries (`src/features/matches/match-actions.ts` lines 6-42).
- Mexicano past-score correction builds a plan from future rounds and can audit `schedule_regenerated`; current code records the plan/audit but does not actually delete/regenerate future matches (`src/features/matches/match-actions.ts` lines 48-80).
- Leaderboard counts completed matches, and abandoned matches only when `countsTowardLeaderboard === true`; ranks by average points, average point difference, win rate, total points, then name (`src/features/leaderboards/leaderboard-engine.ts` lines 31-88).
- Scheduling engines are pure/testable: seeded Americano rotation (`src/features/schedules/americano-scheduler.ts` lines 30-62), fixed-team round robin (`src/features/schedules/team-round-robin-scheduler.ts` lines 21-51), Mexicano individual #1+#4 vs #2+#3 after fair active selection (`src/features/schedules/mexicano-individual-scheduler.ts` lines 17-46), and fair bye selection by fewest matches, longest since bye, rank, name (`src/features/schedules/active-selection.ts` lines 14-45).
- Risk validation flags duplicate participants, wrong player count, score target mismatch, live player changes, fixed-team violations, and court conflicts; save is blocked unless no warnings or override confirmed (`src/features/risk/risk-validation.ts` lines 32-88).

## Architecture

The repo uses a slice-by-feature structure under `src/features/*` with pure domain/model functions, store interfaces, in-memory test stores, Drizzle stores, and action functions. Next App Router pages live under `src/app/*` and should call action/store functions rather than embedding domain rules.

Data flow today:
1. Admin/public pages render mostly mobile-first Tailwind shells.
2. Middleware gates `/admin` with Supabase Auth session cookies.
3. Feature action functions validate input and call a store interface.
4. Drizzle stores persist to Supabase Postgres tables declared in `src/lib/db/schema.ts`.
5. Audit logging is best-effort: `recordAuditEntry` swallows missing store/errors, so product code can pass no store in tests or non-critical flows.

Implemented UI is not as complete as domain code. Many admin pages are placeholders: admin event list, create event form submission, roster/team UI persistence, schedule preview persistence, leaderboard display, activity panel partially wired, and public event read model are not fully connected. The most operationally wired page is score entry.

Presence/realtime: there is no realtime presence. PRD explicitly chooses manual refresh plus optional lightweight auto-refresh for public dashboards, and excludes Supabase Realtime for MVP (`docs/prd-padel-community-platform.md` lines 15, 145-147, 181-182). No online-player/admin presence model exists.

## Start Here

Start with `docs/prd-padel-community-platform.md` for product/design grilling because it states the intended MVP, constraints, and out-of-scope items. Then open `src/lib/db/schema.ts` to understand what is actually persisted, followed by `src/features/*` pure modules to see what behavior is implemented versus only planned.

Key product/design talking points:
- MVP is mobile-first, admin-authenticated, public view-only links, no player accounts.
- Data is structured for future workspace/club ownership, but no permissions model beyond global admins yet.
- Core reliability principles are deterministic scheduling, auditability, override warnings, and preserving match history.
- Biggest gap/risk: UI and persistence are only partially wired; domain/test foundations are ahead of user-facing functionality.
- CSV export, public read model with search/highlight/history, custom court renaming UI, real event creation/listing UI, true schedule persistence/regeneration, and auth login UI remain unfinished.
