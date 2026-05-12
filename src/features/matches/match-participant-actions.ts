"use server";

import { revalidatePath } from "next/cache";
import { createDrizzleMatchStore } from "./drizzle-match-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";

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

  await matchStore.updateParticipants(matchId, { teamOneParticipantIds, teamTwoParticipantIds });
  revalidatePath(`/admin/events/${eventId}/scores`);
  revalidatePath(`/admin/events/${eventId}/leaderboard`);
  revalidatePath(`/events`);
  return { success: true, replacementId: replacement };
}

export async function replaceMatchParticipantFormAction(eventId: string, formData: FormData): Promise<void> {
  await replaceMatchParticipantForTest(eventId, formData);
}
