# Code Context: Architectural Friction and Shallow Modules

## Files Retrieved

1. `src/features/schedules/schedule-form-actions.ts` (lines 1-114) - Schedule generation form action with embedded business logic
2. `src/app/admin/events/[eventId]/scores/page.tsx` (lines 1-170) - Score entry page with embedded form action
3. `src/features/risk/risk-validation.ts` (lines 1-106) - Risk validation pure function
4. `src/features/matches/match-actions.ts` (lines 1-100) - Match domain actions
5. `src/features/leaderboards/leaderboard-engine.ts` (lines 1-100) - Leaderboard calculation pure function
6. `src/app/admin/events/[eventId]/leaderboard/page.tsx` (lines 1-80) - Leaderboard page with data loading
7. `src/features/events/event-form-actions.ts` (lines 1-75) - Event CRUD form actions
8. `src/features/players/player-form-actions.ts` (lines 1-50) - Player roster form actions
9. `src/features/public-dashboard/public-dashboard-loader.ts` (lines 1-25) - Public dashboard data loader
10. `src/features/public-dashboard/public-dashboard.ts` (lines 1-100) - Public dashboard builder
11. `src/app/events/[slug]/page.tsx` (lines 1-150) - Public event page
12. `src/features/matches/match-participant-actions.ts` (lines 1-40) - Match participant replacement

## Key Code

### Form Action Pattern (Shallow Module)

**Problem:** Form actions are thin wrappers that parse FormData, call store factory, call domain action, revalidate paths. Interface complexity ≈ implementation complexity.

```typescript
// src/features/players/player-form-actions.ts
export async function addPlayerToRosterFormAction(eventId: string, prevState: any, formData: FormData) {
  const playerId = formData.get("playerId")?.toString();
  if (!playerId) return { error: "Player ID is required" };
  
  const store = createDrizzlePlayerStore();
  const result = await addPlayerToRosterAction(store, eventId, playerId);
  
  if (!result.ok) return { error: result.errors[0].message };
  
  revalidatePath(`/admin/events/${eventId}/players`);
  return { success: true };
}
```

**Deletion test:** Deleting this module would move FormData parsing and revalidatePath calls into the page component. The domain action `addPlayerToRosterAction` already exists and is testable. The form action adds no domain logic, just Next.js plumbing.

**Pattern repeated in:**
- `event-form-actions.ts` (3 form actions)
- `player-form-actions.ts` (2 form actions)
- `team-form-actions.ts` (1 form action)
- `schedule-form-actions.ts` (1 complex form action)

### Score Entry Page: Embedded Form Action

**Problem:** `scores/page.tsx` embeds a 40-line server action `saveMatchUpdate` that parses FormData, loads event, validates risk, branches on format (Mexicano vs other), calls domain actions, and revalidates paths. This is untestable and couples page rendering to score entry orchestration.

```typescript
// src/app/admin/events/[eventId]/scores/page.tsx (lines 24-62)
async function saveMatchUpdate(formData: FormData) {
  "use server";
  const store = createDrizzleMatchStore();
  const auditStore = createDrizzleAuditLogStore();
  const matchId = String(formData.get("matchId") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const status = String(formData.get("status") ?? "completed") as MatchStatus;
  const teamOneScore = parseOptionalScore(formData.get("teamOneScore"));
  const teamTwoScore = parseOptionalScore(formData.get("teamTwoScore"));
  const overrideConfirmed = formData.get("overrideConfirmed") === "on";
  // ... 8 more lines of parsing
  
  const existing = await store.getMatch(matchId);
  if (!existing) return;
  const event = await loadEvent(existing.eventId);
  if (!event) return;
  
  if (teamOneScore !== null && teamTwoScore !== null) {
    const risk = validateRiskyAdminChanges({ /* ... */ });
    if (!risk.canSave) return;
  }
  
  if (status === "completed" && teamOneScore !== null && teamTwoScore !== null) {
    if (event.format === "mexicano") {
      await correctMexicanoPastScoreAction(/* ... */);
    } else {
      await scoreMatchAction(/* ... */);
    }
  } else {
    await transitionMatchStatusAction(/* ... */);
  }
  
  // 4 revalidatePath calls
}
```

**Friction:**
- Cannot unit test score entry orchestration
- Format branching logic lives in page, not domain
- Risk validation called from page, not encapsulated in action
- Revalidation paths duplicated across pages

### Schedule Generation: Orchestration in Form Action

**Problem:** `schedule-form-actions.ts` contains 114 lines handling preview/save branching, schedule generation, match persistence loop, audit logging, and revalidation. The action knows about rounds, matches, audit, event status transitions, and path revalidation.

```typescript
// src/features/schedules/schedule-form-actions.ts (lines 18-114)
export async function generateScheduleFormAction(eventId: string, prevState: any, formData: FormData) {
  try {
    const store = createDrizzleEventStore();
    const event = await store.getEvent(eventId);
    if (!event) return { error: "Event not found" };
    
    const action = formData.get("action")?.toString();
    
    if (action === "preview") {
      // 30 lines: load roster, load matches, generate schedule, normalize round numbers
      const schedule = generateAmericanoSchedule({ /* ... */ });
      return { preview: normalizedSchedule, success: true, seed, matchCount: countMatches(normalizedSchedule) };
    }
    
    if (action === "save") {
      // 30 lines: parse schedule JSON, loop rounds, loop matches, create DB records, update event status, audit log, revalidate 4 paths
      for (const round of schedule.rounds) {
        const savedRound = await matchStore.createRound({ eventId, roundNumber: round.roundNumber });
        for (const match of round.matches) {
          await matchStore.createMatch({ /* ... */ });
        }
      }
      await store.updateEvent(eventId, { scheduleGenerated: true });
      await store.updateStatus(eventId, "live");
      await recordAuditEntry(auditStore, { /* ... */ });
      // revalidatePath x4
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to generate schedule" };
  }
}
```

**Friction:**
- Schedule persistence logic (loop rounds, loop matches, create records) lives in form action, not a domain module
- Event status transition (`updateStatus(eventId, "live")`) bypasses `transitionEventStatusAction`
- Audit logging called directly instead of being encapsulated in domain action
- Cannot test schedule persistence without mocking FormData and Next.js cache

### Event Read Model: Scattered Data Loading

**Problem:** Every page that needs event + players + matches + teams repeats the same 4-store instantiation and parallel load pattern. No shared read model module.

```typescript
// Pattern repeated in 6+ pages:
const eventStore = createDrizzleEventStore();
const playerStore = createDrizzlePlayerStore();
const teamStore = createDrizzleTeamStore();
const matchStore = createDrizzleMatchStore();

const [players, roster, teams, matches] = await Promise.all([
  playerStore.listPlayers(),
  playerStore.listRoster(eventId),
  teamStore.listTeams(eventId),
  matchStore.listMatches(eventId),
]);

const playerById = new Map(players.map((p) => [p.id, p]));
// Hydrate participant names from IDs...
```

**Locations:**
- `app/admin/events/[eventId]/leaderboard/page.tsx` (lines 16-30)
- `app/admin/events/[eventId]/scores/page.tsx` (lines 83-90)
- `features/public-dashboard/public-dashboard-loader.ts` (lines 10-20)
- `features/exports/event-export-loader.ts` (lines 10-20)
- `app/admin/events/[eventId]/players/page.tsx` (lines 15-22)

**Friction:**
- ID-to-name hydration logic duplicated
- Participant list construction (individual vs fixed-team) duplicated
- No single place to add caching, derived fields, or query optimization
- Hard to test pages because they directly instantiate stores

### Leaderboard Calculation: Pure Function, Impure Callers

**Problem:** `leaderboard-engine.ts` is a well-tested pure function. But every caller must:
1. Load event, players, roster, teams, matches
2. Build participant list (individual vs fixed-team branching)
3. Call `buildLeaderboardMatches` adapter
4. Call `calculateLeaderboard`
5. Hydrate display names

The pure function is tested, but the orchestration around it is not.

```typescript
// Repeated in 3 places:
const participants = event.pairingMode === "fixed_team" 
  ? teams.map(t => ({ id: t.id, displayName: t.displayName }))
  : roster.map(r => {
      const p = playerById.get(r.playerId);
      return p ? { id: p.id, displayName: p.displayName } : null;
    }).filter((p): p is { id: string; displayName: string } => p !== null);

const standings = calculateLeaderboard({ 
  participants, 
  matches: buildLeaderboardMatches(matches) 
});
```

**Locations:**
- `app/admin/events/[eventId]/leaderboard/page.tsx`
- `features/public-dashboard/public-dashboard.ts`

### Risk Validation: Pure Function, Inconsistent Usage

**Problem:** `risk-validation.ts` is a pure, testable function. But it's called from:
- `scores/page.tsx` embedded action (line 45)
- Not called from `match-actions.ts` (domain layer doesn't validate risk)
- Not called from `schedule-form-actions.ts` when saving matches

Risk validation is a cross-cutting concern but has no consistent enforcement point.

### Store Instantiation: Scattered Factory Calls

**Problem:** Every form action and page calls `createDrizzle*Store()` directly. 28 occurrences across features and pages. No dependency injection, no shared context, no transaction boundaries.

```typescript
// Repeated 28 times:
const store = createDrizzleEventStore();
const playerStore = createDrizzlePlayerStore();
const matchStore = createDrizzleMatchStore();
const auditStore = createDrizzleAuditLogStore();
```

**Friction:**
- Cannot wrap stores in transaction
- Cannot inject test doubles without mocking module imports
- No single place to add logging, metrics, or error handling

### Match Participant Replacement: Shallow Action

**Problem:** `match-participant-actions.ts` contains a 40-line function that loads match, loads roster, finds replacement, updates participants, loads event for slug, revalidates 3 paths. The domain logic (find first available player not in match) is trivial. The orchestration is untested.

```typescript
// src/features/matches/match-participant-actions.ts
export async function replaceMatchParticipantForTest(eventId: string, formData: FormData) {
  const matchId = String(formData.get("matchId") ?? "");
  const participantId = String(formData.get("participantId") ?? "");
  // ... validation
  
  const matchStore = createDrizzleMatchStore();
  const playerStore = createDrizzlePlayerStore();
  const match = await matchStore.getMatch(matchId);
  const roster = await playerStore.listRoster(eventId);
  
  const activeIds = new Set([...match.teamOneParticipantIds, ...match.teamTwoParticipantIds]);
  const replacement = roster.map((entry) => entry.playerId).find((id) => !activeIds.has(id));
  // ... update participants
  
  const eventStore = await import("@/features/events/drizzle-event-store").then(m => m.createDrizzleEventStore());
  const event = await eventStore.getEvent(eventId);
  
  revalidatePath(`/admin/events/${eventId}/scores`);
  revalidatePath(`/admin/events/${eventId}/leaderboard`);
  if (event?.publicSlug) revalidatePath(`/events/${event.publicSlug}`);
}
```

**Deletion test:** The domain logic (find replacement) is 2 lines. The rest is store calls and revalidation. Deleting this module would move the logic into the page or a domain action.

## Architecture

### Current Structure

```
src/
├── app/                          # Next.js pages (1095 LOC)
│   ├── admin/events/[eventId]/   # Admin pages embed form actions
│   └── events/[slug]/            # Public page calls loader
├── features/                     # Domain modules (4594 LOC)
│   ├── events/
│   │   ├── event-model.ts        # Pure validation, slug generation
│   │   ├── event-actions.ts      # Domain actions (create, update, transition)
│   │   ├── event-form-actions.ts # Form wrappers (shallow)
│   │   └── drizzle-event-store.ts
│   ├── players/
│   │   ├── player-model.ts       # Pure validation, normalization
│   │   ├── player-actions.ts     # Domain actions
│   │   ├── player-form-actions.ts # Form wrappers (shallow)
│   │   └── drizzle-player-store.ts
│   ├── matches/
│   │   ├── match-model.ts        # Pure score validation, status transitions
│   │   ├── match-actions.ts      # Domain actions (score, transition, correct)
│   │   ├── match-participant-actions.ts # Orchestration + form parsing
│   │   └── drizzle-match-store.ts
│   ├── schedules/
│   │   ├── americano-scheduler.ts # Pure schedule generation
│   │   ├── schedule-form-actions.ts # Orchestration + persistence + audit
│   │   └── mexicano-score-correction.ts # Pure planning
│   ├── leaderboards/
│   │   └── leaderboard-engine.ts # Pure calculation (tested)
│   ├── risk/
│   │   └── risk-validation.ts    # Pure validation (tested)
│   └── public-dashboard/
│       ├── public-dashboard.ts   # Pure builder
│       └── public-dashboard-loader.ts # Data loading orchestration
```

### Seams and Leaks

1. **Form Actions Seam:** Thin wrappers between Next.js and domain. Add little value. 11 form action files.

2. **Page-Embedded Actions:** `scores/page.tsx` embeds 40-line server action. Untestable orchestration.

3. **Store Instantiation:** No seam. Every caller creates stores directly. 28 call sites.

4. **Event Read Model:** No seam. Every page repeats 4-store load + hydration. 6+ call sites.

5. **Schedule Persistence:** Lives in form action, not domain module. Cannot test without FormData.

6. **Risk Validation:** Pure function exists but no enforcement seam. Called inconsistently.

7. **Revalidation Paths:** Duplicated across form actions. No centralized path registry.

### Pure vs Impure Split

**Well-tested pure functions:**
- `leaderboard-engine.ts` (39 test files total in codebase)
- `risk-validation.ts`
- `americano-scheduler.ts`
- `event-model.ts` validation
- `player-model.ts` normalization
- `match-model.ts` score validation

**Untested orchestration:**
- Form actions (11 files, 0 tests for orchestration)
- Page-embedded actions (scores/page.tsx saveMatchUpdate)
- Schedule persistence loop
- Event read model loading
- Store instantiation and coordination

**The gap:** Pure functions are extracted and tested. Orchestration that calls them is embedded in pages/form-actions and untested. Real bugs hide in:
- Format branching (Mexicano vs Americano)
- Risk validation enforcement
- Audit logging consistency
- Revalidation path coverage
- Transaction boundaries

## Start Here

**For Admin/Public Event Read Model Module:**
1. Open `src/features/public-dashboard/public-dashboard-loader.ts` (lines 1-25)
2. Extract pattern: load 4 stores, build participant list, hydrate names
3. Create `src/features/events/event-read-model.ts`
4. Consolidate: `loadEventDashboard(eventId)`, `loadPublicDashboard(slug, query)`
5. Replace call sites in: leaderboard page, scores page, public page, exports page

**For Score Entry Admin Module:**
1. Open `src/app/admin/events/[eventId]/scores/page.tsx` (lines 24-62)
2. Extract `saveMatchUpdate` to `src/features/matches/score-entry-actions.ts`
3. Move format branching, risk validation, audit logging into domain action
4. Add tests for orchestration
5. Replace embedded action with import

**For Schedule Persistence Module:**
1. Open `src/features/schedules/schedule-form-actions.ts` (lines 60-100)
2. Extract persistence loop to `src/features/schedules/schedule-persistence.ts`
3. Create `persistSchedule(eventId, schedule, audit)` domain action
4. Add tests for round/match creation, event status transition, audit logging
5. Replace inline loop with domain action call

## Constraints, Risks, and Open Questions

### Constraints
- Next.js Server Actions require "use server" and FormData signature
- Drizzle stores expect `Db` instance, currently created per-call
- Revalidation paths must be called from server actions, not domain modules
- 39 test files exist, mostly for pure functions

### Risks
- Form actions are shallow but provide Next.js integration point. Deleting them moves FormData parsing into pages.
- Store instantiation is scattered but changing to DI requires refactoring 28 call sites.
- Page-embedded actions are untestable but moving them requires new module boundaries.

### Open Questions
1. **Should form actions exist?** They're shallow but provide a consistent seam between Next.js and domain. Alternative: pages call domain actions directly and handle FormData parsing inline.

2. **Where should risk validation be enforced?** Currently called from page. Options:
   - Enforce in domain actions (match-actions.ts)
   - Enforce in form actions
   - Keep as opt-in validation

3. **Should schedule persistence be a domain action or a form action concern?** Currently in form action. Moving to domain requires passing audit context and handling revalidation separately.

4. **How to handle revalidation paths?** Currently duplicated. Options:
   - Centralized path registry
   - Event-based invalidation
   - Keep duplicated (explicit, local)

5. **Should stores be injected or factory-called?** Currently factory-called at every use site. DI would enable transactions and testing but requires architectural change.

6. **What's the right granularity for read models?** Public dashboard has a loader. Admin pages don't. Should there be one read model module or multiple?

### Metrics
- Total features LOC: 4594
- Total app LOC: 1095
- Test files: 39
- Form action files: 11
- Store instantiation call sites: 28
- Revalidation call sites: 28
- Pages with embedded actions: 1 (scores/page.tsx)
- Pages repeating event read pattern: 6+

### Deletion Test Summary

**High-value modules (would concentrate complexity if deleted):**
- `leaderboard-engine.ts` - Pure calculation, well-tested
- `americano-scheduler.ts` - Pure generation, well-tested
- `risk-validation.ts` - Pure validation, well-tested
- `match-model.ts` - Pure score/status logic, tested
- `event-model.ts` - Pure validation, tested

**Shallow modules (would just move code if deleted):**
- `*-form-actions.ts` (11 files) - Thin FormData wrappers
- `match-participant-actions.ts` - 2 lines domain logic, 38 lines orchestration
- `public-dashboard-loader.ts` - Thin wrapper over buildPublicDashboard

**Missing modules (complexity is scattered):**
- Event read model (repeated 6+ times)
- Schedule persistence (embedded in form action)
- Score entry orchestration (embedded in page)
- Revalidation path registry (duplicated 28 times)
