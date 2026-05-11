import { randomBytes } from "node:crypto";
import { recordAuditEntry, type AuditContext } from "@/features/audit/audit-log";
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

export async function transitionEventStatusAction(store: EventStore, eventId: string, nextStatus: EventStatus, audit: AuditContext = {}): Promise<EventActionResult> {
  const existing = await store.getEvent(eventId);
  if (!existing) return { ok: false, errors: [{ field: "eventId", message: "Event not found" }] };
  if (!getNextEventStatuses(existing.status).includes(nextStatus)) {
    return { ok: false, errors: [{ field: "status", message: `Cannot transition event from ${existing.status} to ${nextStatus}` }] };
  }
  const event = await store.updateStatus(eventId, nextStatus);
  if (!event) return { ok: false, errors: [{ field: "eventId", message: "Event not found" }] };

  if (nextStatus === "completed" || (existing.status === "completed" && nextStatus === "live")) {
    await recordAuditEntry(audit.store, {
      actionType: nextStatus === "completed" ? "event_completed" : "event_reopened",
      actorId: audit.actorId ?? null,
      eventId: event.id,
      entityKind: "event",
      entityId: event.id,
      summary: nextStatus === "completed" ? "Event completed" : "Event reopened",
    });
  }

  return { ok: true, event };
}
