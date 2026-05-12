import { recordAuditEntry, type AuditContext } from "@/features/audit/audit-log";
import { planMexicanoScoreCorrection, type MexicanoScoreCorrectionChoice, type MexicanoScoreCorrectionPlan } from "@/features/schedules/mexicano-score-correction";
import { recordScore, transitionMatchStatus, type MatchActionResult, type MatchRecord, type MatchStatus } from "./match-model";
import type { MatchStore } from "./match-store";

export async function scoreMatchAction(store: MatchStore, matchId: string, input: { teamOneScore: number; teamTwoScore: number; overrideConfirmed?: boolean }, audit: AuditContext = {}): Promise<MatchActionResult> {
  const existing = await store.getMatch(matchId);
  if (!existing) return { ok: false, errors: [{ field: "matchId", message: "Match not found" }] };

  const result = recordScore(existing, input);
  if (!result.ok) return result;

  const saved = await store.updateScore(matchId, {
    status: result.match.status,
    teamOneScore: result.match.teamOneScore,
    teamTwoScore: result.match.teamTwoScore,
  });
  if (!saved) return { ok: false, errors: [{ field: "matchId", message: "Match not found" }] };

  await recordAuditEntry(audit.store, {
    actionType: "score_updated",
    actorId: audit.actorId ?? null,
    eventId: saved.eventId,
    entityKind: "match",
    entityId: saved.id,
    summary: `Score updated to ${saved.teamOneScore}-${saved.teamTwoScore}`,
  });

  return { ok: true, match: saved };
}

export type MexicanoScoreCorrectionActionResult =
  | { ok: true; match: MatchRecord; correctionPlan: MexicanoScoreCorrectionPlan }
  | { ok: false; errors: { field: string; message: string }[]; correctionPlan?: MexicanoScoreCorrectionPlan };

export async function correctMexicanoPastScoreAction(
  store: MatchStore,
  matchId: string,
  input: { teamOneScore: number; teamTwoScore: number; overrideConfirmed?: boolean; correctionChoice?: MexicanoScoreCorrectionChoice },
  audit: AuditContext = {},
): Promise<MexicanoScoreCorrectionActionResult> {
  const existing = await store.getMatch(matchId);
  if (!existing) return { ok: false, errors: [{ field: "matchId", message: "Match not found" }] };

  const matches = await store.listMatches(existing.eventId);
  const correctionPlan = planMexicanoScoreCorrection({ editedRoundNumber: existing.roundNumber, matches });
  const correctionChoice = input.correctionChoice ?? (correctionPlan.requiresChoice ? undefined : "update_score_only");

  if (!correctionChoice || !correctionPlan.availableChoices.includes(correctionChoice)) {
    return { ok: false, errors: [{ field: "correctionChoice", message: "Choose whether to preserve later rounds or regenerate only unplayed future rounds" }], correctionPlan };
  }

  const scored = await scoreMatchAction(store, matchId, input, audit);
  if (!scored.ok) return { ...scored, correctionPlan };

  if (correctionChoice === "update_score_and_regenerate_unplayed_future_rounds") {
    const count = correctionPlan.safeToRegenerateMatchIds.length;
    await recordAuditEntry(audit.store, {
      actionType: "schedule_regenerated",
      actorId: audit.actorId ?? null,
      eventId: scored.match.eventId,
      entityKind: "schedule",
      entityId: scored.match.eventId,
      summary: `Marked ${count} unplayed future ${count === 1 ? "match" : "matches"} for regeneration after round ${existing.roundNumber} score correction`,
    });
  }

  return { ok: true, match: scored.match, correctionPlan };
}

export async function transitionMatchStatusAction(store: MatchStore, matchId: string, nextStatus: MatchStatus, options: { abandonedCountsTowardLeaderboard?: boolean } = {}, audit: AuditContext = {}): Promise<MatchActionResult> {
  const existing = await store.getMatch(matchId);
  if (!existing) return { ok: false, errors: [{ field: "matchId", message: "Match not found" }] };

  const result = transitionMatchStatus(existing, nextStatus, options);
  if (!result.ok) return result;

  const saved = await store.updateStatus(matchId, {
    status: result.match.status,
    abandonedCountsTowardLeaderboard: result.match.abandonedCountsTowardLeaderboard,
  });
  if (!saved) return { ok: false, errors: [{ field: "matchId", message: "Match not found" }] };

  await recordAuditEntry(audit.store, {
    actionType: "match_status_updated",
    actorId: audit.actorId ?? null,
    eventId: saved.eventId,
    entityKind: "match",
    entityId: saved.id,
    summary: `Match status updated from ${existing.status} to ${saved.status}`,
  });

  return { ok: true, match: saved };
}
