"use server";

import { revalidatePath } from "next/cache";
import { createDrizzleAuditLogStore } from "@/features/audit/drizzle-audit-log-store";
import { loadEventReadModel } from "@/features/events/event-read-model";
import { correctMexicanoPastScoreAction, scoreMatchAction, transitionMatchStatusAction } from "@/features/matches/match-actions";
import type { MexicanoScoreCorrectionChoice } from "@/features/schedules/mexicano-score-correction";
import type { MatchStatus } from "@/features/matches/match-model";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { validateRiskyAdminChanges } from "@/features/risk/risk-validation";
import { replaceMatchParticipantFormAction } from "@/features/matches/match-participant-actions";

function parseOptionalScore(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return Number(value);
}

export async function saveMatchUpdate(prevState: any, formData: FormData) {
  try {
    const matchId = String(formData.get("matchId") ?? "").trim();
    const eventId = String(formData.get("eventId") ?? "").trim();
    const status = String(formData.get("status") ?? "completed") as MatchStatus;
    const teamOneScore = parseOptionalScore(formData.get("teamOneScore"));
    const teamTwoScore = parseOptionalScore(formData.get("teamTwoScore"));
    const overrideConfirmed = formData.get("overrideConfirmed") === "on";
    const abandonedCountsTowardLeaderboard = formData.get("abandonedCountsTowardLeaderboard") === "on";
    const correctionChoiceValue = formData.get("correctionChoice");
    const correctionChoice = typeof correctionChoiceValue === "string" && correctionChoiceValue.length > 0 ? (correctionChoiceValue as MexicanoScoreCorrectionChoice) : undefined;

    const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(matchId);
    if (!uuidLike) {
      return { error: "Invalid match ID provided." };
    }

    const store = createDrizzleMatchStore();
    const auditStore = createDrizzleAuditLogStore();
    
    const existing = await store.getMatch(matchId);
    if (!existing) return { error: "Match not found" };
    
    const readModel = await loadEventReadModel(existing.eventId);
    if (!readModel) return { error: "Event not found" };
    const event = readModel.event;

    if (teamOneScore !== null && teamTwoScore !== null) {
      const risk = validateRiskyAdminChanges({
        matches: [{ ...existing, status, teamOneScore, teamTwoScore }],
        originalMatches: [existing],
        overrideConfirmed,
      });
      if (!risk.canSave) {
        return { error: risk.warnings.map(w => w.message).join(", ") };
      }
    }

    if (status === "completed" && teamOneScore !== null && teamTwoScore !== null) {
      if (event.format === "mexicano") {
        const scored = await correctMexicanoPastScoreAction(store, matchId, { teamOneScore, teamTwoScore, overrideConfirmed, correctionChoice }, { store: auditStore, actorId: null });
        if (!scored.ok) return { error: scored.errors.map(e => e.message).join(", ") };
      } else {
        const scored = await scoreMatchAction(store, matchId, { teamOneScore, teamTwoScore, overrideConfirmed }, { store: auditStore, actorId: null });
        if (!scored.ok) return { error: scored.errors.map(e => e.message).join(", ") };
      }
    } else {
      const transitioned = await transitionMatchStatusAction(store, matchId, status, { abandonedCountsTowardLeaderboard }, { store: auditStore, actorId: null });
      if (!transitioned.ok) return { error: transitioned.errors.map(e => e.message).join(", ") };
    }

    if (eventId) {
      revalidatePath(`/admin/events/${eventId}/scores`);
      revalidatePath(`/admin/events/${eventId}/leaderboard`);
      if (event?.publicSlug) revalidatePath(`/events/${event.publicSlug}`);
    }
    
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save match update" };
  }
}

export async function replaceParticipant(eventId: string, participantId: string) {
  const formData = new FormData();
  formData.set("participantId", participantId);
  await replaceMatchParticipantFormAction(eventId, formData);
}