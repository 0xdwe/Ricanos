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
