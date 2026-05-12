"use server";

import { revalidatePath } from "next/cache";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { addPlayerToRosterAction, importPlayersAction } from "@/features/players/player-actions";

export async function addPlayerToRosterFormAction(eventId: string, prevState: any, formData: FormData) {
  const playerId = formData.get("playerId")?.toString();
  if (!playerId) {
    return { error: "Player ID is required" };
  }

  const store = createDrizzlePlayerStore();
  const result = await addPlayerToRosterAction(store, eventId, playerId);

  if (!result.ok) {
    return { error: result.errors[0].message };
  }

  revalidatePath(`/admin/events/${eventId}/players`);
  return { success: true };
}

export async function importPlayersFormAction(eventId: string, prevState: any, formData: FormData) {
  const multilineNames = formData.get("multilineNames")?.toString();
  if (!multilineNames || multilineNames.trim().length === 0) {
    return { error: "Please enter at least one name" };
  }

  const store = createDrizzlePlayerStore();
  
  // 1. Parse and create/find players
  const importResult = await importPlayersAction(store, multilineNames);
  if (!importResult.ok) {
    return { error: importResult.errors[0].message };
  }

  // 2. Add each to roster
  let addedCount = 0;
  for (const player of importResult.players) {
    const addResult = await addPlayerToRosterAction(store, eventId, player.id);
    if (addResult.ok) {
      addedCount++;
    }
  }

  revalidatePath(`/admin/events/${eventId}/players`);
  return { success: true, message: `Successfully added ${addedCount} players to roster` };
}
