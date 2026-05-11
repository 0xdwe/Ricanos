import { recordAuditEntry, type AuditContext } from "@/features/audit/audit-log";
import { recordScore, transitionMatchStatus, type MatchActionResult, type MatchStatus } from "./match-model";
import type { MatchStore } from "./match-store";

export async function scoreMatchAction(store: MatchStore, matchId: string, input: { teamOneScore: number; teamTwoScore: number; overrideConfirmed: boolean }, audit: AuditContext = {}): Promise<MatchActionResult> {
  const existing = await store.getMatch(matchId);
  if (!existing) return { ok: false, errors: [{ field: "matchId", message: "Match not found" }] };

  const result = recordScore(existing, input);
  if (!result.ok) return result;

  const saved = await store.updateScore(matchId, {
    status: result.match.status,
    teamOneScore: result.match.teamOneScore,
    teamTwoScore: result.match.teamTwoScore,
    scoreOverrideWarning: result.match.scoreOverrideWarning,
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

  if (input.overrideConfirmed && saved.scoreOverrideWarning) {
    await recordAuditEntry(audit.store, {
      actionType: "risky_override_confirmed",
      actorId: audit.actorId ?? null,
      eventId: saved.eventId,
      entityKind: "match",
      entityId: saved.id,
      summary: saved.scoreOverrideWarning,
    });
  }

  return { ok: true, match: saved };
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
