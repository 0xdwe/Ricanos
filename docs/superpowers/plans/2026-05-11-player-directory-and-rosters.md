# Player Directory and Event Rosters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Issue 3: admins can manage a reusable player directory, paste multiline player lists, get duplicate suggestions, and attach individual players to event rosters.

**Architecture:** Add a deep roster Module that owns player-name parsing, normalization, duplicate detection, and roster membership rules. Persistence goes through a `player-store` seam with in-memory and Drizzle adapters. Admin UI gets basic directory and event roster shells; full Supabase-backed form submission can build on the tested action Module.

**Tech Stack:** Next.js App Router, TypeScript, Drizzle ORM/Postgres schema, Vitest, Testing Library.

---

## File Structure

- Create `src/features/players/player-model.ts` — player normalization, multiline parsing, duplicate suggestion, roster validation.
- Create `src/features/players/player-model.test.ts` — pure tests for player/roster behavior.
- Modify `src/lib/db/schema.ts` — add `players` and `eventPlayers` tables.
- Create `src/features/players/player-store.ts` — store Interface and record types.
- Create `src/features/players/in-memory-player-store.ts` — in-memory adapter for action tests.
- Create `src/features/players/player-actions.ts` — create players, import players, attach players to event roster.
- Create `src/features/players/player-actions.test.ts` — tested behavior through store seam.
- Create `src/features/players/drizzle-player-store.ts` — Drizzle adapter.
- Create `src/app/admin/players/page.tsx` — reusable player directory shell.
- Create `src/app/admin/events/[eventId]/players/page.tsx` — event roster shell.
- Create `src/features/players/player-pages.test.tsx` — render tests for admin player pages.
- Modify `src/app/admin/page.tsx` — link to player directory.
- Modify `README.md` — update verification note.

## Task 1: Add player domain Module

**Files:**
- Create: `src/features/players/player-model.test.ts`
- Create: `src/features/players/player-model.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/features/players/player-model.test.ts
import { describe, expect, it } from "vitest";
import {
  findDuplicatePlayerSuggestions,
  normalizePlayerName,
  parseMultilinePlayerList,
  validateRosterAdd,
} from "./player-model";

describe("player-model", () => {
  it("normalizes player names for matching while preserving display names separately", () => {
    expect(normalizePlayerName("  Alice   Tan  ")).toBe("alice tan");
    expect(normalizePlayerName("ÁLICE Tan")).toBe("alice tan");
  });

  it("parses multiline player lists and removes empty lines", () => {
    expect(parseMultilinePlayerList("Alice\n\n Bob \nCharlie")).toEqual([
      { displayName: "Alice", normalizedName: "alice" },
      { displayName: "Bob", normalizedName: "bob" },
      { displayName: "Charlie", normalizedName: "charlie" },
    ]);
  });

  it("deduplicates repeated names inside a pasted list", () => {
    expect(parseMultilinePlayerList("Alice\nalice\n ALICE  ")).toEqual([
      { displayName: "Alice", normalizedName: "alice" },
    ]);
  });

  it("suggests existing players with matching normalized names", () => {
    const suggestions = findDuplicatePlayerSuggestions(
      { displayName: " Alice Tan ", normalizedName: "alice tan" },
      [
        { id: "p1", displayName: "Alice Tan", normalizedName: "alice tan" },
        { id: "p2", displayName: "Bob Lim", normalizedName: "bob lim" },
      ],
    );

    expect(suggestions).toEqual([{ id: "p1", displayName: "Alice Tan", normalizedName: "alice tan" }]);
  });

  it("rejects adding the same player twice to an event roster", () => {
    expect(validateRosterAdd("p1", ["p1", "p2"])).toEqual({
      ok: false,
      errors: [{ field: "playerId", message: "Player is already on this event roster" }],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/players/player-model.test.ts
```

Expected: FAIL because `player-model` does not exist.

- [ ] **Step 3: Implement player domain Module**

```ts
// src/features/players/player-model.ts
export type PlayerName = {
  displayName: string;
  normalizedName: string;
};

export type ExistingPlayer = PlayerName & { id: string };
export type FieldError = { field: string; message: string };
export type ValidationResult = { ok: true } | { ok: false; errors: FieldError[] };

export function normalizePlayerName(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function parseMultilinePlayerList(value: string): PlayerName[] {
  const seen = new Set<string>();
  const players: PlayerName[] = [];

  for (const line of value.split(/\r?\n/)) {
    const displayName = line.trim().replace(/\s+/g, " ");
    if (!displayName) continue;
    const normalizedName = normalizePlayerName(displayName);
    if (seen.has(normalizedName)) continue;
    seen.add(normalizedName);
    players.push({ displayName, normalizedName });
  }

  return players;
}

export function findDuplicatePlayerSuggestions(candidate: PlayerName, existingPlayers: ExistingPlayer[]): ExistingPlayer[] {
  return existingPlayers.filter((player) => player.normalizedName === candidate.normalizedName);
}

export function validateRosterAdd(playerId: string, existingRosterPlayerIds: string[]): ValidationResult {
  if (existingRosterPlayerIds.includes(playerId)) {
    return { ok: false, errors: [{ field: "playerId", message: "Player is already on this event roster" }] };
  }
  return { ok: true };
}
```

- [ ] **Step 4: Verify tests pass**

Run:

```bash
npm test -- src/features/players/player-model.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/players/player-model.ts src/features/players/player-model.test.ts
git commit -m "feat: add player roster domain model"
```

## Task 2: Add player schema

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add player tables**

Append imports/exports as needed so `src/lib/db/schema.ts` contains these tables in addition to existing event tables:

```ts
export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  displayName: text("display_name").notNull(),
  normalizedName: text("normalized_name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const eventPlayers = pgTable("event_players", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

- [ ] **Step 2: Verify schema compiles**

Run:

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add player roster database schema"
```

## Task 3: Add player store seam and actions

**Files:**
- Create: `src/features/players/player-store.ts`
- Create: `src/features/players/in-memory-player-store.ts`
- Create: `src/features/players/player-actions.ts`
- Create: `src/features/players/player-actions.test.ts`

- [ ] **Step 1: Write failing action tests**

```ts
// src/features/players/player-actions.test.ts
import { describe, expect, it } from "vitest";
import { addPlayerToRosterAction, createPlayerAction, importPlayersAction } from "./player-actions";
import { createInMemoryPlayerStore } from "./in-memory-player-store";

describe("player actions", () => {
  it("creates a reusable player", async () => {
    const store = createInMemoryPlayerStore();
    const result = await createPlayerAction(store, " Alice Tan ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.player.displayName).toBe("Alice Tan");
      expect(result.player.normalizedName).toBe("alice tan");
    }
  });

  it("reuses an existing player when importing duplicate names", async () => {
    const store = createInMemoryPlayerStore();
    await createPlayerAction(store, "Alice");

    const result = await importPlayersAction(store, "Alice\nBob\nalice");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.players.map((player) => player.displayName)).toEqual(["Alice", "Bob"]);
    }
  });

  it("adds a player to an event roster once", async () => {
    const store = createInMemoryPlayerStore();
    const created = await createPlayerAction(store, "Alice");
    if (!created.ok) throw new Error("expected player");

    const added = await addPlayerToRosterAction(store, "event_1", created.player.id);
    expect(added.ok).toBe(true);

    const duplicate = await addPlayerToRosterAction(store, "event_1", created.player.id);
    expect(duplicate).toEqual({ ok: false, errors: [{ field: "playerId", message: "Player is already on this event roster" }] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/players/player-actions.test.ts
```

Expected: FAIL because actions/store files do not exist.

- [ ] **Step 3: Implement player store Interface**

```ts
// src/features/players/player-store.ts
export type PlayerRecord = {
  id: string;
  displayName: string;
  normalizedName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EventPlayerRecord = {
  id: string;
  eventId: string;
  playerId: string;
  sortOrder: number;
  createdAt: Date;
};

export type PlayerStore = {
  createPlayer(input: { displayName: string; normalizedName: string }): Promise<PlayerRecord>;
  findPlayerByNormalizedName(normalizedName: string): Promise<PlayerRecord | null>;
  listPlayers(): Promise<PlayerRecord[]>;
  listRoster(eventId: string): Promise<EventPlayerRecord[]>;
  addPlayerToRoster(eventId: string, playerId: string): Promise<EventPlayerRecord>;
};
```

- [ ] **Step 4: Implement in-memory adapter**

```ts
// src/features/players/in-memory-player-store.ts
import type { EventPlayerRecord, PlayerRecord, PlayerStore } from "./player-store";

let nextId = 1;
function id(prefix: string) {
  const value = `${prefix}_${nextId}`;
  nextId += 1;
  return value;
}

export function createInMemoryPlayerStore(): PlayerStore {
  const players = new Map<string, PlayerRecord>();
  const roster = new Map<string, EventPlayerRecord[]>();

  return {
    async createPlayer(input) {
      const now = new Date("2026-01-01T00:00:00.000Z");
      const player = { id: id("player"), ...input, createdAt: now, updatedAt: now };
      players.set(player.id, player);
      return player;
    },
    async findPlayerByNormalizedName(normalizedName) {
      return [...players.values()].find((player) => player.normalizedName === normalizedName) ?? null;
    },
    async listPlayers() {
      return [...players.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
    },
    async listRoster(eventId) {
      return roster.get(eventId) ?? [];
    },
    async addPlayerToRoster(eventId, playerId) {
      const existing = roster.get(eventId) ?? [];
      const record = { id: id("event_player"), eventId, playerId, sortOrder: existing.length + 1, createdAt: new Date("2026-01-01T00:00:00.000Z") };
      roster.set(eventId, [...existing, record]);
      return record;
    },
  };
}
```

- [ ] **Step 5: Implement player actions**

```ts
// src/features/players/player-actions.ts
import { normalizePlayerName, parseMultilinePlayerList, validateRosterAdd } from "./player-model";
import type { PlayerRecord, PlayerStore } from "./player-store";

export type PlayerActionResult = { ok: true; player: PlayerRecord } | { ok: false; errors: { field: string; message: string }[] };
export type ImportPlayersResult = { ok: true; players: PlayerRecord[] } | { ok: false; errors: { field: string; message: string }[] };
export type RosterActionResult = { ok: true } | { ok: false; errors: { field: string; message: string }[] };

function displayNameFromInput(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export async function createPlayerAction(store: PlayerStore, name: string): Promise<PlayerActionResult> {
  const displayName = displayNameFromInput(name);
  const normalizedName = normalizePlayerName(displayName);
  if (!displayName) return { ok: false, errors: [{ field: "name", message: "Player name is required" }] };

  const existing = await store.findPlayerByNormalizedName(normalizedName);
  if (existing) return { ok: true, player: existing };

  const player = await store.createPlayer({ displayName, normalizedName });
  return { ok: true, player };
}

export async function importPlayersAction(store: PlayerStore, multilineNames: string): Promise<ImportPlayersResult> {
  const parsed = parseMultilinePlayerList(multilineNames);
  const players: PlayerRecord[] = [];

  for (const candidate of parsed) {
    const existing = await store.findPlayerByNormalizedName(candidate.normalizedName);
    if (existing) {
      players.push(existing);
    } else {
      players.push(await store.createPlayer(candidate));
    }
  }

  return { ok: true, players };
}

export async function addPlayerToRosterAction(store: PlayerStore, eventId: string, playerId: string): Promise<RosterActionResult> {
  const roster = await store.listRoster(eventId);
  const validation = validateRosterAdd(playerId, roster.map((entry) => entry.playerId));
  if (!validation.ok) return validation;
  await store.addPlayerToRoster(eventId, playerId);
  return { ok: true };
}
```

- [ ] **Step 6: Verify tests pass**

Run:

```bash
npm test -- src/features/players/player-actions.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add src/features/players/player-store.ts src/features/players/in-memory-player-store.ts src/features/players/player-actions.ts src/features/players/player-actions.test.ts
git commit -m "feat: add player store and roster actions"
```

## Task 4: Add Drizzle player store adapter

**Files:**
- Create: `src/features/players/drizzle-player-store.ts`

- [ ] **Step 1: Implement adapter**

```ts
// src/features/players/drizzle-player-store.ts
import { eq } from "drizzle-orm";
import { createDb } from "@/lib/db";
import { eventPlayers, players } from "@/lib/db/schema";
import type { EventPlayerRecord, PlayerRecord, PlayerStore } from "./player-store";

type Db = ReturnType<typeof createDb>;

function mapPlayer(row: typeof players.$inferSelect): PlayerRecord {
  return { id: row.id, displayName: row.displayName, normalizedName: row.normalizedName, createdAt: row.createdAt, updatedAt: row.updatedAt };
}

function mapEventPlayer(row: typeof eventPlayers.$inferSelect): EventPlayerRecord {
  return { id: row.id, eventId: row.eventId, playerId: row.playerId, sortOrder: row.sortOrder, createdAt: row.createdAt };
}

export function createDrizzlePlayerStore(db: Db = createDb()): PlayerStore {
  return {
    async createPlayer(input) {
      const [row] = await db.insert(players).values(input).returning();
      return mapPlayer(row);
    },
    async findPlayerByNormalizedName(normalizedName) {
      const [row] = await db.select().from(players).where(eq(players.normalizedName, normalizedName));
      return row ? mapPlayer(row) : null;
    },
    async listPlayers() {
      const rows = await db.select().from(players);
      return rows.map(mapPlayer).sort((a, b) => a.displayName.localeCompare(b.displayName));
    },
    async listRoster(eventId) {
      const rows = await db.select().from(eventPlayers).where(eq(eventPlayers.eventId, eventId));
      return rows.map(mapEventPlayer).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async addPlayerToRoster(eventId, playerId) {
      const existing = await this.listRoster(eventId);
      const [row] = await db.insert(eventPlayers).values({ eventId, playerId, sortOrder: existing.length + 1 }).returning();
      return mapEventPlayer(row);
    },
  };
}
```

- [ ] **Step 2: Verify compile**

Run:

```bash
npm run typecheck
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/players/drizzle-player-store.ts
git commit -m "feat: add Drizzle player store adapter"
```

## Task 5: Add admin player pages

**Files:**
- Create: `src/app/admin/players/page.tsx`
- Create: `src/app/admin/events/[eventId]/players/page.tsx`
- Modify: `src/app/admin/page.tsx`
- Create: `src/features/players/player-pages.test.tsx`

- [ ] **Step 1: Write failing render tests**

```tsx
// src/features/players/player-pages.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PlayerDirectoryPage from "@/app/admin/players/page";
import EventRosterPage from "@/app/admin/events/[eventId]/players/page";

describe("player admin pages", () => {
  it("renders reusable player directory shell", () => {
    render(<PlayerDirectoryPage />);
    expect(screen.getByRole("heading", { name: "Player directory" })).toBeInTheDocument();
    expect(screen.getByLabelText("Add player name")).toBeInTheDocument();
    expect(screen.getByLabelText("Paste player list"))).toBeInTheDocument();
  });

  it("renders event roster shell", async () => {
    const ui = await EventRosterPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Event roster" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Fix the intentional syntax typo in the test before running**

Replace:

```tsx
expect(screen.getByLabelText("Paste player list"))).toBeInTheDocument();
```

With:

```tsx
expect(screen.getByLabelText("Paste player list")).toBeInTheDocument();
```

- [ ] **Step 3: Run test to verify it fails for missing pages**

Run:

```bash
npm test -- src/features/players/player-pages.test.tsx
```

Expected: FAIL because pages do not exist.

- [ ] **Step 4: Implement player directory page**

```tsx
// src/app/admin/players/page.tsx
export default function PlayerDirectoryPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Player directory</h1>
        <p className="mt-2 text-slate-600">Reusable players can be added to future event rosters.</p>
      </div>
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="grid gap-2 font-medium">
          Add player name
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="playerName" />
        </label>
        <label className="grid gap-2 font-medium">
          Paste player list
          <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="playerList" rows={8} />
        </label>
        <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white" type="button">Save players</button>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Implement event roster page**

```tsx
// src/app/admin/events/[eventId]/players/page.tsx
type EventRosterPageProps = { params: Promise<{ eventId: string }> };

export default async function EventRosterPage({ params }: EventRosterPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Event roster</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Add reusable players</h2>
        <p className="mt-2 text-slate-600">Search and roster attachment will connect to the tested player actions.</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Add player directory link to admin page**

In `src/app/admin/page.tsx`, add a link next to create event:

```tsx
<Link className="rounded-lg border border-slate-300 px-5 py-3 text-center font-semibold" href="/admin/players">
  Player directory
</Link>
```

- [ ] **Step 7: Verify tests pass**

Run:

```bash
npm test -- src/features/players/player-pages.test.tsx
npm run typecheck
```

Expected: both pass.

- [ ] **Step 8: Commit**

```bash
git add src/app/admin/players/page.tsx src/app/admin/events/[eventId]/players/page.tsx src/app/admin/page.tsx src/features/players/player-pages.test.tsx
git commit -m "feat: add player directory and roster pages"
```

## Task 6: Final verification and docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README product docs list**

Add this bullet under Product docs:

```md
- Player directory and roster plan: `docs/superpowers/plans/2026-05-11-player-directory-and-rosters.md`
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npm test
npm run typecheck
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key DATABASE_URL=postgres://user:pass@localhost:5432/ricanos npm run build
```

Expected: all pass. The Next.js middleware/proxy deprecation warning may appear and is acceptable for this slice.

- [ ] **Step 3: Commit docs**

```bash
git add README.md docs/superpowers/plans/2026-05-11-player-directory-and-rosters.md
git commit -m "docs: add player roster implementation plan"
```

## Self-Review

- Spec coverage: implements Issue 3 behavior: reusable player directory Module, multiline paste parsing, duplicate handling, and individual event roster attachment rules.
- Deliberate gap: no fixed-team registration yet; that is Issue 4.
- Deliberate gap: production forms are shells; tested actions and store adapters are ready for wiring when Supabase env exists.
- Placeholder scan: no placeholder code snippets remain.
- Type consistency: `PlayerRecord`, `EventPlayerRecord`, `PlayerStore`, and action result names are consistent across tasks.
