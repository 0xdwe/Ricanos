"use server";

import { redirect } from "next/navigation";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createEventAction } from "@/features/events/event-actions";
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
  scoreTarget: z.coerce.number().min(1, "Score target must be positive"),
  roundCount: z.coerce.number().min(1, "Round count must be positive"),
});

export async function createEventFromForm(prevState: any, formData: FormData) {
  const data = {
    name: formData.get("name")?.toString() || "",
    description: formData.get("description")?.toString() || null,
    eventDate: formData.get("eventDate")?.toString() || null,
    venueName: formData.get("venueName")?.toString() || null,
    venueAddress: formData.get("venueAddress")?.toString() || null,
    format: formData.get("format")?.toString() || "americano",
    pairingMode: formData.get("pairingMode")?.toString() || "individual",
    courtCount: formData.get("courtCount")?.toString(),
    scoreTarget: formData.get("scoreTarget")?.toString(),
    roundCount: formData.get("roundCount")?.toString(),
  };

  const parsed = formSchema.safeParse(data);
  
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
