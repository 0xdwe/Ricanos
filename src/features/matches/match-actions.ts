import { recordScore, transitionMatchStatus, type MatchActionResult, type MatchStatus } from "./match-model";
import type { MatchStore } from "./match-store";

export async function scoreMatchAction(store: MatchStore, matchId: string, input: { teamOneScore: number; teamTwoScore: number; overrideConfirmed: boolean }): Promise<MatchActionResult> {
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
  return { ok: true, match: saved };
}

export async function transitionMatchStatusAction(store: MatchStore, matchId: string, nextStatus: MatchStatus, options: { abandonedCountsTowardLeaderboard?: boolean } = {}): Promise<MatchActionResult> {
  const existing = await store.getMatch(matchId);
  if (!existing) return { ok: false, errors: [{ field: "matchId", message: "Match not found" }] };

  const result = transitionMatchStatus(existing, nextStatus, options);
  if (!result.ok) return result;

  const saved = await store.updateStatus(matchId, {
    status: result.match.status,
    abandonedCountsTowardLeaderboard: result.match.abandonedCountsTowardLeaderboard,
  });
  if (!saved) return { ok: false, errors: [{ field: "matchId", message: "Match not found" }] };
  return { ok: true, match: saved };
}
