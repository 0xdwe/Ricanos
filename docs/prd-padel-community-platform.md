# PRD: Padel Community Match Management Platform

## Problem Statement

Community padel managers need a lightweight website to host Americano and Mexicano events without being locked into apps that only support one format. The managers need to create multiple tournaments, manage players or fixed teams, generate fair schedules, manually override pairings and scores when real-life events get messy, and provide players with a simple public view-only dashboard for leaderboard and match information.

The first version should work well on mobile browsers, support multiple admins, preserve event history, and avoid heavy realtime infrastructure by using lightweight refresh behavior.

## Solution

Build a responsive web app for padel event management with an authenticated admin area and public view-only event links.

Admins can create multiple events, choose Americano or Mexicano, choose individual-rotation mode or fixed-team mode, configure courts, scoring target, rounds, roster, and event metadata. The app generates schedules according to the chosen format, supports fair bye rotation when there are more players or teams than available court capacity, and allows admins to preview, edit, override, and audit all important changes.

Players access an unguessable public event link showing leaderboard first, plus current/upcoming matches, match history, and a player search/filter. Public dashboards use manual refresh plus optional lightweight auto-refresh instead of realtime subscriptions for MVP.

Recommended stack: Next.js on Vercel, Supabase Postgres/Auth, Drizzle for typed database access, Tailwind CSS and shadcn/ui for UI.

## User Stories

1. As an admin, I want to create multiple events, so that I can manage recurring padel community tournaments over time.
2. As an admin, I want to view event history, so that I can review past tournaments and results.
3. As an admin, I want to choose Americano or Mexicano when creating an event, so that the event follows the correct match-generation rules.
4. As an admin, I want the event format to be locked after schedule generation, so that scoring and pairing history stay consistent.
5. As an admin, I want to choose individual mode or fixed-team mode, so that I can run both rotating-partner events and partner-registration tournaments.
6. As an admin, I want to enter event name, description, date, venue name, and venue address, so that players understand the event context.
7. As an admin, I want to configure court count, so that schedules match the real venue capacity.
8. As an admin, I want courts to have default numeric labels, so that I can start quickly.
9. As an admin, I want to rename courts, so that I can use real labels like Indoor 1 or Outdoor A.
10. As an admin, I want to configure a fixed total points target per match, so that scoring matches common Americano/Mexicano event rules.
11. As an admin, I want score entry to warn me when scores do not sum to the configured target, so that accidental mistakes are caught.
12. As an admin, I want to override invalid score totals after confirming, so that shortened or unusual matches can still be recorded.
13. As an admin, I want to add players manually, so that I can build an event roster.
14. As an admin, I want to paste a multiline player list, so that roster creation is fast.
15. As an admin, I want to paste fixed teams in a simple format like `Alice / Bob`, so that team events are easy to set up.
16. As an admin, I want reusable player records, so that returning players can be added quickly to future events.
17. As an admin, I want player suggestions while adding names, so that duplicate player records are reduced.
18. As an admin, I want raw match history preserved, so that future cross-event statistics can be calculated.
19. As an admin, I want event rosters separate from the reusable player directory, so that historical event participation is accurate.
20. As an admin, I want multiple admin accounts, so that my co-manager and I can both manage events.
21. As an admin, I want all admins to access all events in MVP, so that setup stays simple.
22. As an admin, I want a draft event state, so that I can configure an event before publishing or starting it.
23. As an admin, I want a ready/scheduled state, so that I can review generated schedules before the event goes live.
24. As an admin, I want a live event state, so that score entry and current round management are enabled.
25. As an admin, I want a completed event state, so that final results are locked by default.
26. As an admin, I want an archived state, so that old events are hidden from active lists while remaining available in history.
27. As an admin, I want to reopen completed events with a warning, so that mistakes can be corrected.
28. As an admin, I want Americano individual schedules to support configurable round count, so that events can fit the available time.
29. As an admin, I want Americano individual scheduling to minimize repeated partners and opponents, so that rotations feel fair.
30. As an admin, I want Americano fixed-team mode to behave as a team round-robin, so that fixed partners play against different opposing teams.
31. As an admin, I want Mexicano individual scheduling to re-rank players after each round, so that future matches reflect current performance.
32. As an admin, I want Mexicano individual power-pairing to group top active players together by rank, so that matches become more competitive.
33. As an admin, I want Mexicano individual teams within a court to be balanced as #1 + #4 vs #2 + #3, so that each match is competitive.
34. As an admin, I want Mexicano fixed-team scheduling to rank teams, so that partner tournaments are scored as team competitions.
35. As an admin, I want Mexicano fixed-team power-pairing to match Team #1 vs Team #2, Team #3 vs Team #4, and so on, so that fixed teams face similarly ranked opponents.
36. As an admin, I want to choose random or manual seed for Mexicano first round, so that I can start casually or with intentional ranking.
37. As an admin, I want deterministic random generation using stored seeds, so that schedules are reproducible and auditable.
38. As an admin, I want to reshuffle generated previews, so that I can choose a better starting schedule before saving.
39. As an admin, I want schedules generated upfront for Americano and fixed-team round-robin events, so that I can review all planned rounds.
40. As an admin, I want Mexicano rounds generated round-by-round after scores are complete, so that rankings drive the next matches.
41. As an admin, I want to preview generated schedules before saving, so that I can catch problems before players see them.
42. As an admin, I want to manually edit generated rounds before the event starts, so that I can account for real-life constraints.
43. As an admin, I want to swap players between courts during an event, so that I can respond to late changes or mistakes.
44. As an admin, I want risky live edits to require confirmation, so that rankings and ongoing matches are not accidentally damaged.
45. As an admin, I want manual overrides to be marked, so that the system does not silently regenerate over my decisions.
46. As an admin, I want duplicate player, wrong player count, court conflict, and fixed-team violation warnings, so that invalid schedules are visible.
47. As an admin, I want to force-save invalid schedules after confirmation, so that real-life edge cases can still be handled.
48. As an admin, I want to enter and edit scores at any time, so that corrections are possible.
49. As an admin, I want past Mexicano score edits to warn me when later rounds depended on old rankings, so that I understand the consequences.
50. As an admin, I want to choose between updating score only or regenerating unplayed future rounds, so that I can control the impact of corrections.
51. As an admin, I want completed and ongoing matches protected from regeneration, so that player results are not accidentally erased.
52. As an admin, I want fair bye rotation when there are more players than court capacity, so that community nights can support extra participants.
53. As an admin, I want active players selected by fewest matches played and longest time since bye before ranking-based pairing, so that byes do not unfairly favor top players.
54. As an admin, I want to manually mark players or teams as resting/unavailable for a round, so that the schedule respects real attendance.
55. As an admin, I want match statuses for scheduled, in-progress, completed, and abandoned, so that match state is explicit.
56. As an admin, I want abandoned matches to optionally count or not count toward leaderboard, so that unusual match endings are handled fairly.
57. As an admin, I want leaderboard ranking to account for byes using averages, so that players with fewer matches are not unfairly penalized.
58. As an admin, I want individual leaderboards ranked by average points per match, average point difference, win rate, total points, then name, so that ranking is fair and stable.
59. As an admin, I want team leaderboards ranked by team metrics, so that fixed-team competitions are scored correctly.
60. As an admin, I want leaderboards to display matches played, total points, and average points, so that rankings are transparent.
61. As an admin, I want fixed-team leaderboards to rank teams only while displaying both player names, so that competition results are clear.
62. As an admin, I want a lightweight audit log, so that I can see who changed scores, pairings, generation, completion, or reopening.
63. As an admin, I want a recent admin activity panel, so that I can quickly detect mistakes during live events.
64. As an admin, I want CSV exports for leaderboard, matches, and scores, so that I can keep records and analyze results externally.
65. As an admin, I want safe event settings editable anytime, so that names, descriptions, court names, and refresh behavior can change without risk.
66. As an admin, I want risky settings editable only with confirmation, so that score target, total rounds, roster, and court count changes are deliberate.
67. As an admin, I want format and pairing mode locked after first schedule generation, so that the event model remains consistent.
68. As a player, I want a public view-only event link, so that I can follow the tournament without creating an account.
69. As a player, I want the public link to show full event details by default, so that I can see names, matches, and history.
70. As a player, I want the public link to be unguessable, so that the event is shareable without being easily discoverable.
71. As a player, I want the dashboard to show leaderboard first, so that I can quickly see current standings.
72. As a player, I want to see current and upcoming matches, so that I know where and when to play.
73. As a player, I want to see past matches and scores, so that I can understand leaderboard changes.
74. As a player, I want to search or select my name, so that I can highlight my leaderboard row and matches.
75. As a player, I want manual refresh, so that I can update the dashboard when needed.
76. As a player, I want optional lightweight auto-refresh, so that the dashboard can stay reasonably up to date without realtime infrastructure.
77. As a player, I want the public dashboard to be strictly view-only, so that scores cannot be manipulated by anyone with the link.
78. As a mobile admin, I want large tap targets and mobile-first score entry, so that I can manage matches courtside.
79. As a mobile player, I want the website to work well in phone browsers, so that I do not need to install an app.
80. As a future product owner, I want the data model to support future club/workspace ownership, so that the app can later serve multiple communities with permissions.

## Implementation Decisions

- Build a new responsive web app using Next.js, Supabase Auth/Postgres, Drizzle, Tailwind CSS, and shadcn/ui.
- Use Vercel for hosting.
- Use authenticated admin routes for management and unguessable public event links for players.
- Do not require player accounts for MVP.
- Support multiple events and persistent event history from day one.
- Use one global admin area for MVP where all admins can manage all events.
- Structure data so future club/workspace ownership can be added later without a full rewrite.
- Event format is fixed at creation and locked after first schedule generation.
- Pairing mode is event-level: individual mode or fixed-team mode.
- Avoid mixed fixed-pair and solo-player events in MVP.
- Store reusable player records and event roster records separately.
- Store teams for fixed-team events; fixed-team competition rankings are team-based.
- Store raw matches and scores so future aggregate stats can be computed by format and mode.
- Use event lifecycle states: draft, ready/scheduled, live, completed, archived.
- Use match lifecycle states: scheduled, in-progress, completed, abandoned.
- Abandoned matches can be configured to count or not count toward leaderboard.
- Use configurable fixed total points target per event.
- Validate score totals against target by default, with admin override confirmation.
- Leaderboard for bye-capable individual events uses average points per match, average point difference, win rate, total points, then stable name tie-break.
- Display matches played, total points, and average points for transparency.
- Americano individual generation supports configurable round count and aims to minimize repeated partners/opponents.
- Americano fixed-team mode is treated as team round-robin.
- Mexicano individual generation is round-by-round and re-ranks after each completed round.
- Mexicano individual power-pairing selects active players through fair bye rotation first, sorts by ranking second, groups active players into rank buckets of four, then creates teams as #1 + #4 vs #2 + #3.
- Mexicano fixed-team power-pairing ranks teams and pairs Team #1 vs Team #2, Team #3 vs Team #4, etc.
- Mexicano first round can be random or manually seeded.
- Generate Americano and fixed-team round-robin schedules upfront.
- Generate Mexicano rounds one at a time after prior scores are complete.
- Store random seeds for deterministic and reproducible generation.
- Provide preview-before-save for schedule generation.
- Support reshuffle and manual editing before schedule confirmation.
- Mark manual schedule or score interventions as overrides.
- Warn on risky edits, including live match changes, ranking-affecting score changes, duplicate players, court conflicts, incorrect player counts, and fixed-team violations.
- Allow confirmed admin overrides even when validations fail.
- When editing past Mexicano scores, admins choose between preserving later generated rounds or regenerating only unplayed future rounds.
- Never regenerate completed or ongoing matches automatically.
- Support custom court names with numeric defaults.
- Use round numbers only for MVP, not timed match schedules.
- Provide fair bye rotation when roster size exceeds court capacity.
- Allow admins to manually mark players or teams unavailable/resting for a round.
- Provide audit events for score updates, match/player swaps, schedule generation/regeneration, event completion, event reopening, and risky overrides.
- Public dashboard shows leaderboard first, then current/upcoming matches and history.
- Public dashboard includes player search/filter and highlighting.
- Public dashboard uses manual refresh plus optional lightweight auto-refresh; no Supabase Realtime for MVP.
- Provide CSV export for leaderboard, matches, and scores.
- No notifications/reminders in MVP.
- Minimal event customization only: name, description, date, venue name, venue address.

### Proposed Deep Modules

- **Tournament Scheduling Engine**: Pure, deterministic scheduling functions for Americano individual rotation, fixed-team round robin, Mexicano individual power-pairing, Mexicano fixed-team pairing, bye selection, seeding, reshuffling, and schedule validation.
- **Leaderboard Engine**: Pure scoring and ranking functions for individual and team modes, including abandoned-match inclusion rules, average metrics, tie-breakers, and transparent stat output.
- **Event State Machine**: Encapsulates allowed event lifecycle transitions, locked settings, risky settings, and reopen/archive behavior.
- **Risk and Validation Engine**: Produces warnings and confirmation requirements for score edits, live swaps, invalid schedules, risky setting changes, and Mexicano regeneration decisions.
- **Audit Log Service**: Centralized recording of admin actions with actor, event, affected entity, action type, before/after summary, and timestamp.
- **Roster and Player Directory Service**: Manages reusable players, event rosters, team registration, multiline imports, duplicate suggestions, and later historical stats foundations.
- **Public Event Read Model**: Produces optimized view-only dashboard data for leaderboard, current matches, upcoming matches, match history, refresh metadata, and player filtering.
- **CSV Export Service**: Produces stable exports for leaderboards, matches, scores, and event metadata.

## Testing Decisions

- Tests should focus on external behavior and domain outcomes, not implementation details.
- Scheduling tests should verify valid match counts, court capacity, no duplicate active players in a round unless explicitly overridden, fair bye rotation, reproducible seeded generation, minimized repeats for Americano, and correct Mexicano power-pairing.
- Leaderboard tests should verify scoring totals, averages, point difference, win rate, abandoned-match inclusion/exclusion, team ranking, and all tie-breaker behavior.
- Event state machine tests should verify allowed and blocked transitions, locked format/pairing mode behavior, completed-event reopen behavior, and risky setting classification.
- Risk and validation tests should verify warnings for risky score edits, invalid score totals, changing rankings after Mexicano rounds exist, duplicate players, court conflicts, fixed-team violations, and forced overrides.
- Roster tests should verify multiline imports, fixed-team parsing, reusable-player suggestions, duplicate handling, and event roster separation from the player directory.
- Public dashboard tests should verify that only view-only data is exposed, leaderboard-first ordering is preserved, player filtering highlights the correct data, and private admin controls are absent.
- Authorization tests should verify that admin operations require authentication and public event links cannot mutate data.
- Audit log tests should verify that important admin actions create audit entries with sufficient context.
- CSV export tests should verify stable headers and correct inclusion of leaderboard, match, and score data.
- Since the repository is currently empty, there is no existing prior test structure to reuse yet. The initial test setup should prioritize pure unit tests for deep modules before UI-heavy tests.

## Out of Scope

- Native mobile apps.
- Player login/accounts.
- Player-submitted scores or score disputes.
- Supabase Realtime live subscriptions for MVP.
- Push, SMS, email, or WhatsApp notifications/reminders.
- Club/workspace UI and per-club permissions.
- Mixed events containing both fixed teams and solo rotating players.
- Non-multiple-of-four active match structures.
- Normal padel set scoring.
- Full branding/theming, logos, or custom event banners.
- Advanced cross-event player statistics UI.
- CSV import beyond multiline paste.
- Timed match scheduling.

## Further Notes

The repository is currently empty, so this PRD describes the initial product foundation rather than changes to an existing application.

The biggest architectural risk is scheduling complexity. The scheduling and leaderboard logic should be built as pure, framework-independent modules with deterministic inputs and outputs. This keeps the most complicated domain behavior testable outside the UI and database.

The MVP should prioritize reliability during live events: clear confirmations, reversible/admin-controlled regeneration, visible audit history, and mobile-friendly score entry are more important than realtime updates or visual polish.

Publishing note: no project issue tracker configuration or triage label tooling was available in this environment, so this PRD has been written to the repository as a document. When an issue tracker is connected, publish this document as an issue and apply the `needs-triage` label.
