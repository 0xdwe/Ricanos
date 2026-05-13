"use server";

import { createDrizzleAuditLogStore } from "@/features/audit/drizzle-audit-log-store";
import { createDrizzleEventStore } from "./drizzle-event-store";
import { transitionEventStatusAction } from "./event-actions";
import { revalidateEventPaths } from "./event-revalidation";
import type { EventStatus } from "./event-model";

export async function transitionEventStatusFormAction(eventId: string, nextStatus: EventStatus) {
  const store = createDrizzleEventStore();
  const event = await store.getEvent(eventId);
  
  const result = await transitionEventStatusAction(store, eventId, nextStatus, {
    store: createDrizzleAuditLogStore(),
    actorId: null,
  });

  revalidateEventPaths(eventId, event, { includeScores: true, includePublic: true });

  if (!result.ok) return;
  return;
}
