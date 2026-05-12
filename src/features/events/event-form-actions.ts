"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createEventAction, updateEventAction } from "@/features/events/event-actions";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().nullable().optional(),
  eventDate: z.string().nullable().optional(),
  venueName: z.string().nullable().optional(),
  venueAddress: z.string().nullable().optional(),
  format: z.enum(["americano", "mexicano"]),
  pairingMode: z.enum(["individual", "fixed_team"]),
  courtCount: z.coerce.number().min(1, "Must have at least 1 court"),
  roundCount: z.coerce.number().min(1, "Round count must be positive"),
});

function parseEventForm(formData: FormData) {
  return formSchema.safeParse({
    name: formData.get("name")?.toString() || "",
    description: formData.get("description")?.toString() || null,
    eventDate: formData.get("eventDate")?.toString() || null,
    venueName: formData.get("venueName")?.toString() || null,
    venueAddress: formData.get("venueAddress")?.toString() || null,
    format: formData.get("format")?.toString() || "americano",
    pairingMode: formData.get("pairingMode")?.toString() || "individual",
    courtCount: formData.get("courtCount")?.toString(),
    roundCount: formData.get("roundCount")?.toString(),
  });
}

export async function createEventFromForm(prevState: any, formData: FormData) {
  const parsed = parseEventForm(formData);
  
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const store = createDrizzleEventStore();
  const result = await createEventAction(store, parsed.data);

  if (!result.ok) {
    return { error: result.errors[0].message };
  }

  redirect(`/admin/events/${result.event.id}`);
}

export async function updateEventFromForm(eventId: string, prevState: any, formData: FormData) {
  const parsed = parseEventForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const store = createDrizzleEventStore();
  const event = await store.getEvent(eventId);
  const result = await updateEventAction(store, eventId, parsed.data);
  if (!result.ok) return { error: result.errors[0].message };

  revalidatePath("/admin");
  revalidatePath(`/admin/events/${eventId}`);
  if (event?.publicSlug) revalidatePath(`/events/${event.publicSlug}`);
  return { success: true };
}

export async function deleteEventFromForm(eventId: string) {
  const store = createDrizzleEventStore();
  const event = await store.getEvent(eventId);
  await store.deleteEvent(eventId);
  revalidatePath("/admin");
  if (event?.publicSlug) revalidatePath(`/events/${event.publicSlug}`);
  redirect("/admin");
}
