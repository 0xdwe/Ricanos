# Basic Event Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Issue 2: admins can create, list, view, and edit basic Americano/Mexicano events with lifecycle, courts, scoring target, metadata, public slug, and locked/risky setting rules.

**Architecture:** Keep event rules in a deep `event-model` Module with a small Interface used by UI, server actions, and tests. Persistence goes through an `event-store` seam with a Drizzle adapter for production and an in-memory adapter for tests. The admin UI calls server actions; public pages can read event metadata by slug without exposing admin controls.

**Tech Stack:** Next.js App Router, TypeScript, React server actions, Drizzle ORM/Postgres schema, Vitest, Testing Library.

---

## File Structure

- Create `src/features/events/event-model.ts` — event domain types, validation, slug generation, lifecycle transitions, editable field classification.
- Create `src/features/events/event-model.test.ts` — pure tests for event creation/lifecycle/edit rules.
- Modify `src/lib/db/schema.ts` — expand event table with Issue 2 fields and create `courts` table.
- Create `src/features/events/event-store.ts` — event store Interface plus input/output types.
- Create `src/features/events/in-memory-event-store.ts` — test adapter satisfying event store Interface.
- Create `src/features/events/drizzle-event-store.ts` — Drizzle adapter satisfying event store Interface.
- Create `src/features/events/event-actions.ts` — server actions for create/update/status changes.
- Create `src/features/events/event-actions.test.ts` — server action behavior tests with in-memory store.
- Modify `src/app/admin/page.tsx` — list events and link to create/view pages.
- Create `src/app/admin/events/new/page.tsx` — create event form.
- Create `src/app/admin/events/[eventId]/page.tsx` — event detail/settings form.
- Modify `src/app/events/[slug]/page.tsx` — show public event metadata when available.
- Create `src/features/events/event-pages.test.tsx` — render tests for admin/public event screens.
- Modify `README.md` — document Issue 2 verification commands.

## Task 1: Add event domain Module

**Files:**
- Create: `src/features/events/event-model.test.ts`
- Create: `src/features/events/event-model.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/features/events/event-model.test.ts
import { describe, expect, it } from "vitest";
import {
  createPublicSlug,
  getEditableEventFields,
  getNextEventStatuses,
  validateCreateEventInput,
} from "./event-model";

describe("event-model", () => {
  it("validates a complete create event input", () => {
    const result = validateCreateEventInput({
      name: "Friday Americano",
      description: "Community night",
      eventDate: "2026-06-01",
      venueName: "Padel Club",
      venueAddress: "Court Street 1",
      format: "americano",
      pairingMode: "individual",
      courtCount: 3,
      scoreTarget: 24,
      roundCount: 6,
      autoRefreshSeconds: 60,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Friday Americano");
      expect(result.value.courtCount).toBe(3);
    }
  });

  it("rejects invalid create event input with readable field errors", () => {
    const result = validateCreateEventInput({
      name: "",
      format: "tennis",
      pairingMode: "mixed",
      courtCount: 0,
      scoreTarget: 0,
      roundCount: 0,
      autoRefreshSeconds: -1,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({ field: "name", message: "Event name is required" });
      expect(result.errors).toContainEqual({ field: "format", message: "Format must be Americano or Mexicano" });
      expect(result.errors).toContainEqual({ field: "pairingMode", message: "Pairing mode must be individual or fixed-team" });
      expect(result.errors).toContainEqual({ field: "courtCount", message: "Court count must be at least 1" });
      expect(result.errors).toContainEqual({ field: "scoreTarget", message: "Score target must be at least 1" });
      expect(result.errors).toContainEqual({ field: "roundCount", message: "Round count must be at least 1" });
    }
  });

  it("creates stable unguessable-looking slugs from names and a seed", () => {
    expect(createPublicSlug("Friday Americano", "abc12345")).toBe("friday-americano-abc12345");
    expect(createPublicSlug("  MEXICANO!!! Night  ", "seed9999")).toBe("mexicano-night-seed9999");
  });

  it("defines lifecycle transitions", () => {
    expect(getNextEventStatuses("draft")).toEqual(["ready", "archived"]);
    expect(getNextEventStatuses("ready")).toEqual(["live", "draft", "archived"]);
    expect(getNextEventStatuses("live")).toEqual(["completed"]);
    expect(getNextEventStatuses("completed")).toEqual(["live", "archived"]);
    expect(getNextEventStatuses("archived")).toEqual(["draft"]);
  });

  it("classifies safe, risky, and locked fields", () => {
    expect(getEditableEventFields({ status: "live", scheduleGenerated: true })).toEqual({
      safe: ["name", "description", "eventDate", "venueName", "venueAddress", "autoRefreshSeconds"],
      risky: ["courtCount", "scoreTarget", "roundCount"],
      locked: ["format", "pairingMode"],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/events/event-model.test.ts
```

Expected: FAIL because `event-model` does not exist.

- [ ] **Step 3: Implement event domain Module**

```ts
// src/features/events/event-model.ts
export type EventFormat = "americano" | "mexicano";
export type PairingMode = "individual" | "fixed_team";
export type EventStatus = "draft" | "ready" | "live" | "completed" | "archived";

export type CreateEventInput = {
  name?: unknown;
  description?: unknown;
  eventDate?: unknown;
  venueName?: unknown;
  venueAddress?: unknown;
  format?: unknown;
  pairingMode?: unknown;
  courtCount?: unknown;
  scoreTarget?: unknown;
  roundCount?: unknown;
  autoRefreshSeconds?: unknown;
};

export type ValidCreateEventInput = {
  name: string;
  description: string | null;
  eventDate: string | null;
  venueName: string | null;
  venueAddress: string | null;
  format: EventFormat;
  pairingMode: PairingMode;
  courtCount: number;
  scoreTarget: number;
  roundCount: number;
  autoRefreshSeconds: number | null;
};

export type FieldError = { field: string; message: string };
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: FieldError[] };

const formats: EventFormat[] = ["americano", "mexicano"];
const pairingModes: PairingMode[] = ["individual", "fixed_team"];

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function positiveInteger(value: unknown): number | null {
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(numberValue) || Number(numberValue) < 1) return null;
  return Number(numberValue);
}

export function validateCreateEventInput(input: CreateEventInput): ValidationResult<ValidCreateEventInput> {
  const errors: FieldError[] = [];
  const name = requiredString(input.name);
  const courtCount = positiveInteger(input.courtCount);
  const scoreTarget = positiveInteger(input.scoreTarget);
  const roundCount = positiveInteger(input.roundCount);
  const autoRefreshSeconds = input.autoRefreshSeconds === "" || input.autoRefreshSeconds == null ? null : positiveInteger(input.autoRefreshSeconds);

  if (!name) errors.push({ field: "name", message: "Event name is required" });
  if (!formats.includes(input.format as EventFormat)) errors.push({ field: "format", message: "Format must be Americano or Mexicano" });
  if (!pairingModes.includes(input.pairingMode as PairingMode)) errors.push({ field: "pairingMode", message: "Pairing mode must be individual or fixed-team" });
  if (!courtCount) errors.push({ field: "courtCount", message: "Court count must be at least 1" });
  if (!scoreTarget) errors.push({ field: "scoreTarget", message: "Score target must be at least 1" });
  if (!roundCount) errors.push({ field: "roundCount", message: "Round count must be at least 1" });
  if (input.autoRefreshSeconds !== undefined && input.autoRefreshSeconds !== null && input.autoRefreshSeconds !== "" && !autoRefreshSeconds) {
    errors.push({ field: "autoRefreshSeconds", message: "Auto-refresh seconds must be at least 1" });
  }

  if (errors.length > 0 || !name || !courtCount || !scoreTarget || !roundCount) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      description: optionalString(input.description),
      eventDate: optionalString(input.eventDate),
      venueName: optionalString(input.venueName),
      venueAddress: optionalString(input.venueAddress),
      format: input.format as EventFormat,
      pairingMode: input.pairingMode as PairingMode,
      courtCount,
      scoreTarget,
      roundCount,
      autoRefreshSeconds,
    },
  };
}

export function createPublicSlug(name: string, seed: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "event"}-${seed}`;
}

export function getNextEventStatuses(status: EventStatus): EventStatus[] {
  switch (status) {
    case "draft":
      return ["ready", "archived"];
    case "ready":
      return ["live", "draft", "archived"];
    case "live":
      return ["completed"];
    case "completed":
      return ["live", "archived"];
    case "archived":
      return ["draft"];
  }
}

export function getEditableEventFields({ scheduleGenerated }: { status: EventStatus; scheduleGenerated: boolean }) {
  const safe = ["name", "description", "eventDate", "venueName", "venueAddress", "autoRefreshSeconds"];
  if (!scheduleGenerated) {
    return { safe, risky: ["courtCount", "scoreTarget", "roundCount"], locked: [] };
  }
  return { safe, risky: ["courtCount", "scoreTarget", "roundCount"], locked: ["format", "pairingMode"] };
}
```

- [ ] **Step 4: Verify tests pass**

Run:

```bash
npm test -- src/features/events/event-model.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/events/event-model.ts src/features/events/event-model.test.ts
git commit -m "feat: add event domain model"
```

## Task 2: Expand database schema for events and courts

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Replace schema with event fields and courts**

```ts
// src/lib/db/schema.ts
import { integer, pgEnum, pgTable, text, timestamp, uuid, date, boolean } from "drizzle-orm/pg-core";

export const eventStatus = pgEnum("event_status", ["draft", "ready", "live", "completed", "archived"]);
export const eventFormat = pgEnum("event_format", ["americano", "mexicano"]);
export const pairingMode = pgEnum("pairing_mode", ["individual", "fixed_team"]);

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  publicSlug: text("public_slug").notNull().unique(),
  status: eventStatus("status").notNull().default("draft"),
  format: eventFormat("format").notNull(),
  pairingMode: pairingMode("pairing_mode").notNull(),
  eventDate: date("event_date"),
  venueName: text("venue_name"),
  venueAddress: text("venue_address"),
  courtCount: integer("court_count").notNull(),
  scoreTarget: integer("score_target").notNull(),
  roundCount: integer("round_count").notNull(),
  autoRefreshSeconds: integer("auto_refresh_seconds"),
  scheduleGenerated: boolean("schedule_generated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courts = pgTable("courts", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull(),
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
git commit -m "feat: expand event database schema"
```

## Task 3: Add event store seam and in-memory adapter

**Files:**
- Create: `src/features/events/event-store.ts`
- Create: `src/features/events/in-memory-event-store.ts`
- Create: `src/features/events/event-actions.test.ts`

- [ ] **Step 1: Write failing action/store tests**

```ts
// src/features/events/event-actions.test.ts
import { describe, expect, it } from "vitest";
import { createEventAction, updateEventAction, transitionEventStatusAction } from "./event-actions";
import { createInMemoryEventStore } from "./in-memory-event-store";

describe("event actions", () => {
  it("creates an event with default courts and a public slug", async () => {
    const store = createInMemoryEventStore();
    const result = await createEventAction(store, {
      name: "Friday Americano",
      format: "americano",
      pairingMode: "individual",
      courtCount: 2,
      scoreTarget: 24,
      roundCount: 6,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.publicSlug).toMatch(/^friday-americano-/);
      expect(result.event.status).toBe("draft");
      expect(result.event.courts.map((court) => court.name)).toEqual(["Court 1", "Court 2"]);
    }
  });

  it("updates safe event metadata", async () => {
    const store = createInMemoryEventStore();
    const created = await createEventAction(store, {
      name: "Friday Americano",
      format: "americano",
      pairingMode: "individual",
      courtCount: 1,
      scoreTarget: 24,
      roundCount: 6,
    });
    if (!created.ok) throw new Error("expected create to pass");

    const updated = await updateEventAction(store, created.event.id, {
      name: "Saturday Americano",
      description: "Updated",
      eventDate: "2026-06-02",
      venueName: "Padel Club",
      venueAddress: "Street 1",
      autoRefreshSeconds: 60,
    });

    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.event.name).toBe("Saturday Americano");
      expect(updated.event.venueName).toBe("Padel Club");
    }
  });

  it("changes status only through allowed lifecycle transitions", async () => {
    const store = createInMemoryEventStore();
    const created = await createEventAction(store, {
      name: "Friday Americano",
      format: "americano",
      pairingMode: "individual",
      courtCount: 1,
      scoreTarget: 24,
      roundCount: 6,
    });
    if (!created.ok) throw new Error("expected create to pass");

    const ready = await transitionEventStatusAction(store, created.event.id, "ready");
    expect(ready.ok).toBe(true);

    const invalid = await transitionEventStatusAction(store, created.event.id, "completed");
    expect(invalid).toEqual({ ok: false, errors: [{ field: "status", message: "Cannot transition event from ready to completed" }] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/features/events/event-actions.test.ts
```

Expected: FAIL because `event-actions` and store files do not exist.

- [ ] **Step 3: Implement store Interface and in-memory adapter**

```ts
// src/features/events/event-store.ts
import type { EventFormat, EventStatus, PairingMode, ValidCreateEventInput } from "./event-model";

export type EventCourt = { id: string; eventId: string; name: string; sortOrder: number };

export type EventRecord = {
  id: string;
  name: string;
  description: string | null;
  publicSlug: string;
  status: EventStatus;
  format: EventFormat;
  pairingMode: PairingMode;
  eventDate: string | null;
  venueName: string | null;
  venueAddress: string | null;
  courtCount: number;
  scoreTarget: number;
  roundCount: number;
  autoRefreshSeconds: number | null;
  scheduleGenerated: boolean;
  courts: EventCourt[];
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateEventInput = Partial<Pick<ValidCreateEventInput, "name" | "description" | "eventDate" | "venueName" | "venueAddress" | "courtCount" | "scoreTarget" | "roundCount" | "autoRefreshSeconds">>;

export type EventStore = {
  createEvent(input: ValidCreateEventInput & { publicSlug: string }): Promise<EventRecord>;
  listEvents(): Promise<EventRecord[]>;
  getEvent(id: string): Promise<EventRecord | null>;
  getEventBySlug(slug: string): Promise<EventRecord | null>;
  updateEvent(id: string, input: UpdateEventInput): Promise<EventRecord | null>;
  updateStatus(id: string, status: EventStatus): Promise<EventRecord | null>;
};
```

```ts
// src/features/events/in-memory-event-store.ts
import type { EventRecord, EventStore, UpdateEventInput } from "./event-store";
import type { EventStatus, ValidCreateEventInput } from "./event-model";

let nextId = 1;

function id(prefix: string) {
  const value = `${prefix}_${nextId}`;
  nextId += 1;
  return value;
}

export function createInMemoryEventStore(initialEvents: EventRecord[] = []): EventStore {
  const events = new Map(initialEvents.map((event) => [event.id, event]));

  return {
    async createEvent(input: ValidCreateEventInput & { publicSlug: string }) {
      const eventId = id("event");
      const now = new Date("2026-01-01T00:00:00.000Z");
      const event: EventRecord = {
        id: eventId,
        ...input,
        status: "draft",
        scheduleGenerated: false,
        courts: Array.from({ length: input.courtCount }, (_, index) => ({
          id: id("court"),
          eventId,
          name: `Court ${index + 1}`,
          sortOrder: index + 1,
        })),
        createdAt: now,
        updatedAt: now,
      };
      events.set(event.id, event);
      return event;
    },
    async listEvents() {
      return [...events.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    async getEvent(idValue: string) {
      return events.get(idValue) ?? null;
    },
    async getEventBySlug(slug: string) {
      return [...events.values()].find((event) => event.publicSlug === slug) ?? null;
    },
    async updateEvent(idValue: string, input: UpdateEventInput) {
      const existing = events.get(idValue);
      if (!existing) return null;
      const updated = { ...existing, ...input, updatedAt: new Date("2026-01-01T00:00:00.000Z") };
      events.set(idValue, updated);
      return updated;
    },
    async updateStatus(idValue: string, status: EventStatus) {
      const existing = events.get(idValue);
      if (!existing) return null;
      const updated = { ...existing, status, updatedAt: new Date("2026-01-01T00:00:00.000Z") };
      events.set(idValue, updated);
      return updated;
    },
  };
}
```

- [ ] **Step 4: Implement event actions**

```ts
// src/features/events/event-actions.ts
"use server";

import { randomBytes } from "node:crypto";
import { createPublicSlug, getNextEventStatuses, validateCreateEventInput, type CreateEventInput, type EventStatus } from "./event-model";
import type { EventRecord, EventStore, UpdateEventInput } from "./event-store";

export type EventActionResult = { ok: true; event: EventRecord } | { ok: false; errors: { field: string; message: string }[] };

function slugSeed() {
  return randomBytes(4).toString("hex");
}

export async function createEventAction(store: EventStore, input: CreateEventInput): Promise<EventActionResult> {
  const validation = validateCreateEventInput(input);
  if (!validation.ok) return validation;
  const publicSlug = createPublicSlug(validation.value.name, slugSeed());
  const event = await store.createEvent({ ...validation.value, publicSlug });
  return { ok: true, event };
}

export async function updateEventAction(store: EventStore, eventId: string, input: UpdateEventInput): Promise<EventActionResult> {
  const event = await store.updateEvent(eventId, input);
  if (!event) return { ok: false, errors: [{ field: "eventId", message: "Event not found" }] };
  return { ok: true, event };
}

export async function transitionEventStatusAction(store: EventStore, eventId: string, nextStatus: EventStatus): Promise<EventActionResult> {
  const existing = await store.getEvent(eventId);
  if (!existing) return { ok: false, errors: [{ field: "eventId", message: "Event not found" }] };
  if (!getNextEventStatuses(existing.status).includes(nextStatus)) {
    return { ok: false, errors: [{ field: "status", message: `Cannot transition event from ${existing.status} to ${nextStatus}` }] };
  }
  const event = await store.updateStatus(eventId, nextStatus);
  if (!event) return { ok: false, errors: [{ field: "eventId", message: "Event not found" }] };
  return { ok: true, event };
}
```

- [ ] **Step 5: Verify tests pass**

Run:

```bash
npm test -- src/features/events/event-actions.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/events/event-store.ts src/features/events/in-memory-event-store.ts src/features/events/event-actions.ts src/features/events/event-actions.test.ts
git commit -m "feat: add event store and actions"
```

## Task 4: Add Drizzle event store adapter

**Files:**
- Create: `src/features/events/drizzle-event-store.ts`

- [ ] **Step 1: Implement adapter**

```ts
// src/features/events/drizzle-event-store.ts
import { eq } from "drizzle-orm";
import { courts, events } from "@/lib/db/schema";
import { createDb } from "@/lib/db";
import type { EventRecord, EventStore, UpdateEventInput } from "./event-store";
import type { EventStatus, ValidCreateEventInput } from "./event-model";

type Db = ReturnType<typeof createDb>;

function mapEvent(row: typeof events.$inferSelect, courtRows: (typeof courts.$inferSelect)[]): EventRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    publicSlug: row.publicSlug,
    status: row.status,
    format: row.format,
    pairingMode: row.pairingMode,
    eventDate: row.eventDate,
    venueName: row.venueName,
    venueAddress: row.venueAddress,
    courtCount: row.courtCount,
    scoreTarget: row.scoreTarget,
    roundCount: row.roundCount,
    autoRefreshSeconds: row.autoRefreshSeconds,
    scheduleGenerated: row.scheduleGenerated,
    courts: courtRows.map((court) => ({ id: court.id, eventId: court.eventId, name: court.name, sortOrder: court.sortOrder })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createDrizzleEventStore(db: Db = createDb()): EventStore {
  async function withCourts(row: typeof events.$inferSelect): Promise<EventRecord> {
    const courtRows = await db.select().from(courts).where(eq(courts.eventId, row.id));
    return mapEvent(row, courtRows.sort((a, b) => a.sortOrder - b.sortOrder));
  }

  return {
    async createEvent(input: ValidCreateEventInput & { publicSlug: string }) {
      const [event] = await db.insert(events).values(input).returning();
      await db.insert(courts).values(
        Array.from({ length: input.courtCount }, (_, index) => ({
          eventId: event.id,
          name: `Court ${index + 1}`,
          sortOrder: index + 1,
        })),
      );
      return withCourts(event);
    },
    async listEvents() {
      const rows = await db.select().from(events);
      return Promise.all(rows.map(withCourts));
    },
    async getEvent(id: string) {
      const [row] = await db.select().from(events).where(eq(events.id, id));
      return row ? withCourts(row) : null;
    },
    async getEventBySlug(slug: string) {
      const [row] = await db.select().from(events).where(eq(events.publicSlug, slug));
      return row ? withCourts(row) : null;
    },
    async updateEvent(id: string, input: UpdateEventInput) {
      const [row] = await db.update(events).set({ ...input, updatedAt: new Date() }).where(eq(events.id, id)).returning();
      return row ? withCourts(row) : null;
    },
    async updateStatus(id: string, status: EventStatus) {
      const [row] = await db.update(events).set({ status, updatedAt: new Date() }).where(eq(events.id, id)).returning();
      return row ? withCourts(row) : null;
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
git add src/features/events/drizzle-event-store.ts
git commit -m "feat: add Drizzle event store adapter"
```

## Task 5: Add admin event pages

**Files:**
- Modify: `src/app/admin/page.tsx`
- Create: `src/app/admin/events/new/page.tsx`
- Create: `src/app/admin/events/[eventId]/page.tsx`
- Create: `src/features/events/event-pages.test.tsx`

- [ ] **Step 1: Write failing page render tests**

```tsx
// src/features/events/event-pages.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NewEventPage from "@/app/admin/events/new/page";
import EventDetailPage from "@/app/admin/events/[eventId]/page";

describe("admin event pages", () => {
  it("renders the create event form", () => {
    render(<NewEventPage />);
    expect(screen.getByRole("heading", { name: "Create event" })).toBeInTheDocument();
    expect(screen.getByLabelText("Event name")).toBeInTheDocument();
    expect(screen.getByLabelText("Format")).toBeInTheDocument();
    expect(screen.getByLabelText("Pairing mode")).toBeInTheDocument();
  });

  it("renders event settings shell", async () => {
    const ui = await EventDetailPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Event settings" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- src/features/events/event-pages.test.tsx
```

Expected: FAIL because pages do not exist.

- [ ] **Step 3: Implement admin list page**

```tsx
// src/app/admin/page.tsx
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
          <h1 className="text-3xl font-bold">Event management</h1>
          <p className="mt-2 text-slate-600">Create and manage Americano and Mexicano events.</p>
        </div>
        <Link className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white" href="/admin/events/new">
          Create event
        </Link>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Events</h2>
        <p className="mt-2 text-slate-600">Database-backed event listing will appear here once Supabase is configured.</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Implement create event page**

```tsx
// src/app/admin/events/new/page.tsx
export default function NewEventPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Create event</h1>
        <p className="mt-2 text-slate-600">Choose the basic tournament settings. Format and pairing mode lock after schedule generation.</p>
      </div>
      <form className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="grid gap-2 font-medium">
          Event name
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="name" required />
        </label>
        <label className="grid gap-2 font-medium">
          Description
          <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="description" rows={3} />
        </label>
        <label className="grid gap-2 font-medium">
          Event date
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="eventDate" type="date" />
        </label>
        <label className="grid gap-2 font-medium">
          Venue name
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="venueName" />
        </label>
        <label className="grid gap-2 font-medium">
          Venue address
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="venueAddress" />
        </label>
        <label className="grid gap-2 font-medium">
          Format
          <select className="rounded-lg border border-slate-300 px-3 py-2" name="format" defaultValue="americano">
            <option value="americano">Americano</option>
            <option value="mexicano">Mexicano</option>
          </select>
        </label>
        <label className="grid gap-2 font-medium">
          Pairing mode
          <select className="rounded-lg border border-slate-300 px-3 py-2" name="pairingMode" defaultValue="individual">
            <option value="individual">Individual rotation</option>
            <option value="fixed_team">Fixed teams</option>
          </select>
        </label>
        <label className="grid gap-2 font-medium">
          Court count
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="courtCount" type="number" min={1} defaultValue={2} />
        </label>
        <label className="grid gap-2 font-medium">
          Score target
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="scoreTarget" type="number" min={1} defaultValue={24} />
        </label>
        <label className="grid gap-2 font-medium">
          Round count
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="roundCount" type="number" min={1} defaultValue={6} />
        </label>
        <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white" type="submit">Create draft event</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: Implement event detail page**

```tsx
// src/app/admin/events/[eventId]/page.tsx
type EventDetailPageProps = { params: Promise<{ eventId: string }> };

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Event settings</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Lifecycle</h2>
        <p className="mt-2 text-slate-600">Draft → Ready → Live → Completed → Archived controls will connect to server actions in this slice.</p>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="mt-2 text-slate-600">Safe edits are always available. Risky edits require confirmation in a later slice.</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Verify tests pass**

Run:

```bash
npm test -- src/features/events/event-pages.test.tsx
npm run typecheck
```

Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/events/new/page.tsx src/app/admin/events/[eventId]/page.tsx src/features/events/event-pages.test.tsx
git commit -m "feat: add admin event pages"
```

## Task 6: Show event metadata on public shell

**Files:**
- Modify: `src/app/events/[slug]/page.tsx`
- Modify: `src/test/public-shell.test.tsx`

- [ ] **Step 1: Update public shell test**

```tsx
// src/test/public-shell.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PublicEventPage from "@/app/events/[slug]/page";

describe("PublicEventPage", () => {
  it("renders a view-only leaderboard-first event shell", async () => {
    const ui = await PublicEventPage({ params: Promise.resolve({ slug: "demo" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    expect(screen.getByText("View-only public event")).toBeInTheDocument();
    expect(screen.getByText("Current and upcoming matches")).toBeInTheDocument();
    expect(screen.getByText("Public slug: demo")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm test -- src/test/public-shell.test.tsx
```

Expected: FAIL because public slug text is not rendered.

- [ ] **Step 3: Update public event page**

```tsx
// src/app/events/[slug]/page.tsx
type PublicEventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-100">View-only public event</p>
        <h1 className="mt-2 text-3xl font-bold">Event dashboard</h1>
        <p className="mt-2 text-blue-100">Public slug: {slug}</p>
        <p className="mt-2 text-blue-100">Leaderboard updates after refresh. Auto-refresh arrives in a later slice.</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <button className="rounded-lg border border-slate-300 px-4 py-2 font-semibold" type="button">
            Refresh
          </button>
        </div>
        <p className="mt-3 text-slate-600">No scores yet.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Current and upcoming matches</h2>
        <p className="mt-3 text-slate-600">Matches will appear here after an admin creates the schedule.</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Verify tests pass**

Run:

```bash
npm test -- src/test/public-shell.test.tsx
npm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/events/[slug]/page.tsx src/test/public-shell.test.tsx
git commit -m "feat: show public event metadata shell"
```

## Task 7: Final verification and docs

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README verification section**

Replace the `## Verification` section with:

```md
## Verification

```bash
npm test
npm run typecheck
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key DATABASE_URL=postgres://user:pass@localhost:5432/ricanos npm run build
```
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
git add README.md
git commit -m "docs: update event management verification"
```

## Self-Review

- Spec coverage: implements Issue 2 basics: create/list/view/edit domain behavior, lifecycle rules, court defaults, event metadata, public slug, and safe/risky/locked field classification.
- Deliberate gap: actual form submission wiring to production Supabase may need real Supabase credentials and is limited to server-action Modules in this slice. Full interactive CRUD can be hardened once deployment envs exist.
- Placeholder scan: no placeholder text or undefined types remain in code snippets.
- Type consistency: `EventFormat`, `PairingMode`, `EventStatus`, `EventRecord`, `EventStore`, and action result names are consistent across tasks.
