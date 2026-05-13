"use server";

import { createDrizzleMatchStore } from "./drizzle-match-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { revalidateScorePaths } from "@/features/events/event-revalidation";

export async function replaceMatchParticipantForTest(eventId: string, formData: FormData) {
  const matchId = String(formData.get("matchId") ?? "");
  const participantId = String(formData.get("participantId") ?? "");
  if (!matchId || !participantId) return { error: "Choose a player to replace." };

  const matchStore = createDrizzleMatchStore();
  const playerStore = createDrizzlePlayerStore();
  const match = await matchStore.getMatch(matchId);
  if (!match || match.eventId !== eventId) return { error: "Match not found." };
  if (match.status === "completed") return { error: "Completed matches cannot be changed." };

  const roster = await playerStore.listRoster(eventId);
  const activeIds = new Set([...match.teamOneParticipantIds, ...match.teamTwoParticipantIds]);
  const replacement = roster.map((entry) => entry.playerId).find((id) => !activeIds.has(id));
  if (!replacement) return { error: "No available replacement player found." };

  const teamOneParticipantIds = match.teamOneParticipantIds.map((id) => id === participantId ? replacement : id);
  const teamTwoParticipantIds = match.teamTwoParticipantIds.map((id) => id === participantId ? replacement : id);

  if (!teamOneParticipantIds.includes(replacement) && !teamTwoParticipantIds.includes(replacement)) {
    return { error: "Selected player is not in this match." };
  }

  const updated = await matchStore.updateParticipants(matchId, { teamOneParticipantIds, teamTwoParticipantIds }, match.updatedAt);
  if (!updated) return { error: "Another admin updated this match at the same time. Please refresh and try again." };
  
  const eventStore = await import("@/features/events/drizzle-event-store").then(m => m.createDrizzleEventStore());
  const event = await eventStore.getEvent(eventId);
  
  revalidateScorePaths(eventId, event);
  return { success: true, replacementId: replacement };
}

export async function replaceMatchParticipantFormAction(eventId: string, formData: FormData): Promise<void> {
  await replaceMatchParticipantForTest(eventId, formData);
}
