# Fixed-Team Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Issue 4: admins can register fixed teams of two players for fixed-team events, including paste input like `Alice / Bob`.

**Architecture:** Add a deep team Module for parsing and validating fixed-team input. Persistence goes through a `team-store` seam with in-memory and Drizzle adapters. UI adds an event fixed-team roster shell that uses the tested Module vocabulary.

**Tech Stack:** Next.js App Router, TypeScript, Drizzle ORM/Postgres schema, Vitest, Testing Library.

---

## Tasks

1. Add `team-model` tests and implementation for parsing `Alice / Bob`, rejecting invalid team lines, and deriving team display names.
2. Add `teams` and `team_players` schema tables.
3. Add `team-store`, in-memory adapter, and `team-actions` for creating fixed teams with two reusable players.
4. Add Drizzle team store adapter.
5. Add admin fixed-team event roster page and tests.
6. Run `npm test`, `npm run typecheck`, and env-backed `npm run build`; commit all changes.
