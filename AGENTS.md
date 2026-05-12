# Agent instructions for Ricanos

## Communication

- Use caveman mode when active: terse, no filler, technical substance intact.
- Keep paths clear.
- Report exact validation commands and results.

## Product source of truth

Read these before product/architecture work:

1. `docs/prd-padel-community-platform.md`
2. `docs/issues/proposed-issues.md`
3. `CONTEXT.md`

Current product: mobile-first padel event manager for Americano/Mexicano. Admin-authenticated management, public view-only dashboard. No player login for MVP. Manual refresh + lightweight auto-refresh, no realtime MVP.

## Workflow memory

Default workflow for each proposed issue:

1. Ensure `main` clean.
2. Launch exactly one writer `worker` subagent in isolated worktree when possible.
3. Worker must not run subagents.
4. Worker uses TDD, commits changes, reports tests/build/commit SHA.
5. Parent creates branch from worker commit if needed.
6. Run two fresh-context reviewers in parallel:
   - spec compliance reviewer
   - code quality reviewer
7. If either reviewer finds blocker, apply fixes or launch fix worker.
8. Re-review until PASS/approved.
9. Run on main/non-temp checkout before merge or after merge:
   - `npm test`
   - `npm run typecheck`
   - `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key DATABASE_URL=postgres://user:pass@localhost:5432/ricanos npm run build`
10. Merge to `main`, push GitHub.
11. Continue next issue automatically unless user stops.

## Subagent rules

- Use subagents for implementation/review when tool available.
- Keep writes single-threaded. Do not run multiple writer workers on overlapping code.
- Parallel agents best for review, scouting, planning, context-building.
- Use fresh-context reviewers for adversarial review.
- If subagent worktree disappears but commit SHA exists, recover with `git branch <name> <sha>`.
- Worktree Turbopack builds may fail with node_modules symlink panic. Verify default `npm run build` from normal repo checkout before merge/final claim.

## Current issue progress

Completed and merged through Issue 13:

- 1 Bootstrap Next.js/admin/public shell
- 2 Basic event management
- 3 Player directory/rosters
- 4 Fixed-team registration
- 5 Leaderboard engine/UI shell
- 6 Americano schedule preview
- 7 Fixed-team round-robin preview
- 8 Mexicano individual rounds
- 9 Mexicano fixed-team rounds
- 10 Byes/rest selection
- 11 Score entry/statuses
- 12 Risky edits/overrides/audit log
- 13 Mexicano past score correction planning

Next issue: 14 Public player dashboard.

## Architecture direction

Priority deepening opportunity before/inside Issue 14:

- Build an **Admin/Public event read model Module**.
- Keep joins, ID-to-name hydration, leaderboard-ready data, current/upcoming/history matching, and player search data out of pages.
- Public dashboard should consume read model data and remain view-only.

Other important deepening candidates:

- Score entry admin Module: move FormData parsing/event lookup/risk/audit branching out of page.
- Schedule persistence Module: one save path for generated rounds/matches/audit.
- Shared action result/form state Module.
- Decide later whether match participants stay JSON or move to relational rows.
- Event settings policy Module for locked/risky/safe fields.

## Validation notes

- `npm run lint` may be broken because `next lint` is deprecated/invalid in installed Next version. Do not treat as product failure unless script fixed.
- GitHub sometimes returns temporary 500 on push; retry once.
- Remove subagent `progress.md` if created and not intentionally tracked.

## Repo conventions

- Feature Modules live under `src/features/*`.
- Pure domain logic should have unit tests.
- Store seams use interface + in-memory Adapter + Drizzle Adapter when persistence exists.
- Admin pages live under `src/app/admin/*`.
- Public pages live under `src/app/events/*`.
- DB schema lives in `src/lib/db/schema.ts`; migrations under `drizzle/`.
