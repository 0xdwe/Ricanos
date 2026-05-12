# Admin/Public Event Read Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve codebase architecture by extracting a shared, deep Event Read Model Module that hydrates event, participants, leaderboard, and ordered matches, removing duplication from loaders and domain models.

**Architecture:** Create `src/features/events/event-read-model.ts` exposing `loadEventReadModel(slug)`. Re-wire `public-dashboard-loader` and `event-export-loader` to use it instead of doing N+1 fetch orchestration.

**Tasks:**
- [ ] 1. Create `EventReadModel` interface and `buildEventReadModel` pure function inside `src/features/events/event-read-model.ts` extracting participant/label hydration from `public-dashboard.ts`.
- [ ] 2. Create `loadEventReadModel` using Drizzle stores, replacing N+1 player fetch with a joined roster query if possible, or an optimized id-based fetch.
- [ ] 3. Update `public-dashboard.ts` and `public-dashboard-loader.ts` to accept the new `EventReadModel`.
- [ ] 4. Update `event-export.ts` and `event-export-loader.ts` to consume the same read model instead of fetching raw players.
- [ ] 5. Run tests, verify public dashboard and exports work locally, check `npm test` and `typecheck`.
