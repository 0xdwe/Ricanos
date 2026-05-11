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
