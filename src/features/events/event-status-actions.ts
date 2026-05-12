"use server";

import { revalidatePath } from "next/cache";
import { createDrizzleAuditLogStore } from "@/features/audit/drizzle-audit-log-store";
import { createDrizzleEventStore } from "./drizzle-event-store";
import { transitionEventStatusAction } from "./event-actions";
import type { EventStatus } from "./event-model";

export async function transitionEventStatusFormAction(eventId: string, nextStatus: EventStatus) {
  const store = createDrizzleEventStore();
  const event = await store.getEvent(eventId);
  
  const result = await transitionEventStatusAction(store, eventId, nextStatus, {
    store: createDrizzleAuditLogStore(),
    actorId: null,
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/scores`);
  if (event?.publicSlug) revalidatePath(`/events/${event.publicSlug}`);

  if (!result.ok) return;
  return;
}
