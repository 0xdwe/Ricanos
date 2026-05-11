# Proposed Issues: Ricanos Padel Platform

Source PRD: `docs/prd-padel-community-platform.md`

These are tracer-bullet issues: each slice should deliver a narrow, complete path through schema, server behavior, UI, and tests where applicable.

## 1. Bootstrap Next.js app with admin auth and public shell

**Type:** AFK  
**Blocked by:** None  
**User stories covered:** 20, 21, 68, 77, 78, 79

Set up Next.js, Supabase Auth, Drizzle, Tailwind/shadcn, admin-only routes, and read-only public route structure.

## 2. Create and manage basic events

**Type:** AFK  
**Blocked by:** 1  
**User stories covered:** 1–7, 22–27, 65–67

Admin can create/edit/list events with format, pairing mode, lifecycle, event date, venue, courts, scoring target, and public slug.

## 3. Build reusable player directory and individual event rosters

**Type:** AFK  
**Blocked by:** 2  
**User stories covered:** 13–19

Admin can add players manually, paste multiline lists, reuse existing players, and attach players to event rosters.

## 4. Build fixed-team roster registration

**Type:** AFK  
**Blocked by:** 2, 3  
**User stories covered:** 5, 15, 34, 59, 61

Admin can create fixed teams from reusable players, paste `Alice / Bob`, and manage team rosters for fixed-team events.

## 5. Implement leaderboard engine and event leaderboard UI

**Type:** AFK  
**Blocked by:** 3  
**User stories covered:** 57–61, 71

Calculates individual/team rankings using average points, average point difference, win rate, total points, and stable tie-breakers.

## 6. Generate Americano individual schedules with preview

**Type:** AFK  
**Blocked by:** 2, 3  
**User stories covered:** 28–29, 37–43

Admin can generate seeded Americano individual rotations, preview, reshuffle, edit, and save rounds.

## 7. Generate fixed-team round-robin schedules with preview

**Type:** AFK  
**Blocked by:** 4  
**User stories covered:** 30, 37–43

Admin can generate, preview, reshuffle, edit, and save fixed-team round-robin schedules.

## 8. Generate Mexicano individual rounds

**Type:** AFK  
**Blocked by:** 3, 5  
**User stories covered:** 31–33, 36–40

Admin can choose random/manual seed for round 1, then generate future rounds from current rankings using #1+#4 vs #2+#3 power-pairing.

## 9. Generate Mexicano fixed-team rounds

**Type:** AFK  
**Blocked by:** 4, 5  
**User stories covered:** 34–35, 36–40

Admin can generate fixed-team Mexicano rounds by ranking teams and pairing Team #1 vs #2, #3 vs #4, etc.

## 10. Support byes, fair active selection, and manual rest flags

**Type:** AFK  
**Blocked by:** 6, 7, 8, 9  
**User stories covered:** 52–54

Scheduling supports rosters larger than court capacity and lets admins mark players/teams unavailable for a round.

## 11. Enter scores and update match statuses

**Type:** AFK  
**Blocked by:** 5, 6  
**User stories covered:** 10–12, 48, 55–56, 60

Admin can mark matches scheduled/in-progress/completed/abandoned, enter scores, validate target totals, and update leaderboard.

## 12. Handle risky edits, overrides, and audit log

**Type:** AFK  
**Blocked by:** 11  
**User stories covered:** 44–47, 62–63

Admin sees warnings for risky edits, can force confirmed overrides, and audit entries are recorded/displayed.

## 13. Handle Mexicano past score corrections and future regeneration

**Type:** AFK  
**Blocked by:** 8, 9, 11, 12  
**User stories covered:** 49–51

Editing past Mexicano scores prompts admin to preserve later rounds or regenerate only unplayed future rounds.

## 14. Build public player dashboard

**Type:** AFK  
**Blocked by:** 5, 11  
**User stories covered:** 68–77

Public link shows leaderboard first, current/upcoming matches, history, player search/highlighting, manual refresh, and lightweight auto-refresh.

## 15. Export event data as CSV

**Type:** AFK  
**Blocked by:** 5, 11  
**User stories covered:** 64

Admin can export leaderboard, matches, scores, and event metadata.

## 16. Mobile-first live event polish pass

**Type:** HITL  
**Blocked by:** 11, 14  
**User stories covered:** 78–79

Review score-entry and player dashboard UX on phone-sized screens; adjust tap targets, layout, sticky actions, and readability.

## 17. Production readiness: deploy, environment setup, and GitHub/Vercel docs

**Type:** HITL  
**Blocked by:** 1, 14  
**User stories covered:** general delivery

Configure deployment docs, required environment variables, Supabase setup notes, and verify Vercel deployment path.

## Publishing Status

GitHub CLI is not installed in this environment, so these have not yet been published as GitHub issues. When `gh` or another issue publishing method is available, create these in dependency order and apply the `needs-triage` label.
