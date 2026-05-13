"use server";

import { revalidatePath } from "next/cache";
import { createDrizzleTeamStore } from "./drizzle-team-store";

// Note: Team changes only affect teams/players pages until matches are generated

function parsePairLine(line: string) {
  const parts = line.split(/\s*(?:\/|,|\+|&| and )\s*/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  return parts as [string, string];
}

export async function bulkAddTeamsFormAction(eventId: string, prevState: any, formData: FormData) {
  const raw = formData.get("teams")?.toString() ?? "";
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return { error: "Add at least one player pair." };

  const parsedPairs = lines.map((line, index) => ({ line, index: index + 1, pair: parsePairLine(line) }));
  const invalid = parsedPairs.find((item) => !item.pair);
  if (invalid) return { error: `Line ${invalid.index} must contain exactly 2 players.` };

  const store = createDrizzleTeamStore();
  for (const item of parsedPairs) {
    const [firstName, secondName] = item.pair!;
    const [first, second] = await Promise.all([store.createOrFindPlayer(firstName), store.createOrFindPlayer(secondName)]);
    await store.createTeam({ eventId, displayName: `${first.displayName} / ${second.displayName}`, playerIds: [first.id, second.id] });
  }

  revalidatePath(`/admin/events/${eventId}/players`);
  revalidatePath(`/admin/events/${eventId}/teams`);
  return { success: true, count: parsedPairs.length };
}
