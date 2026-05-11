import type { LeaderboardMatch } from "@/features/leaderboards/leaderboard-engine";

export type MatchStatus = "scheduled" | "in_progress" | "completed" | "abandoned";

export type MatchRecord = {
  id: string;
  eventId: string;
  roundId: string | null;
  roundNumber: number;
  courtNumber: number;
  status: MatchStatus;
  teamOneParticipantIds: string[];
  teamTwoParticipantIds: string[];
  teamOneScore: number | null;
  teamTwoScore: number | null;
  scoreTarget: number;
  scoreOverrideWarning: string | null;
  abandonedCountsTowardLeaderboard: boolean;
  updatedAt: Date;
};

export type MatchValidationError = { field: string; message: string };
export type MatchActionResult = { ok: true; match: MatchRecord } | { ok: false; errors: MatchValidationError[] };

export function validateFixedTargetScore(input: { teamOneScore: number; teamTwoScore: number; scoreTarget: number; overrideConfirmed: boolean }): { ok: boolean; warning: string | null } {
  const total = input.teamOneScore + input.teamTwoScore;
  if (total === input.scoreTarget) return { ok: true, warning: null };

  const warning = `Score total ${total} does not match target ${input.scoreTarget}`;
  return { ok: input.overrideConfirmed, warning };
}

export function recordScore(match: MatchRecord, input: { teamOneScore: number; teamTwoScore: number; overrideConfirmed: boolean }): MatchActionResult {
  if (!Number.isInteger(input.teamOneScore) || input.teamOneScore < 0) return { ok: false, errors: [{ field: "teamOneScore", message: "Team one score must be a non-negative whole number" }] };
  if (!Number.isInteger(input.teamTwoScore) || input.teamTwoScore < 0) return { ok: false, errors: [{ field: "teamTwoScore", message: "Team two score must be a non-negative whole number" }] };

  const validation = validateFixedTargetScore({ ...input, scoreTarget: match.scoreTarget });
  if (!validation.ok) return { ok: false, errors: [{ field: "score", message: validation.warning ?? "Invalid score" }] };

  return {
    ok: true,
    match: {
      ...match,
      status: "completed",
      teamOneScore: input.teamOneScore,
      teamTwoScore: input.teamTwoScore,
      scoreOverrideWarning: validation.warning,
      updatedAt: new Date(),
    },
  };
}

export function transitionMatchStatus(match: MatchRecord, nextStatus: MatchStatus, options: { abandonedCountsTowardLeaderboard?: boolean } = {}): MatchActionResult {
  if (nextStatus === "completed" && (match.teamOneScore === null || match.teamTwoScore === null)) {
    return { ok: false, errors: [{ field: "status", message: "Completed matches require both scores" }] };
  }

  return {
    ok: true,
    match: {
      ...match,
      status: nextStatus,
      abandonedCountsTowardLeaderboard: nextStatus === "abandoned" ? options.abandonedCountsTowardLeaderboard ?? match.abandonedCountsTowardLeaderboard : match.abandonedCountsTowardLeaderboard,
      updatedAt: new Date(),
    },
  };
}

export function buildLeaderboardMatches(matches: MatchRecord[]): LeaderboardMatch[] {
  return matches.map((match) => ({
    status: match.status,
    countsTowardLeaderboard: match.status === "abandoned" ? match.abandonedCountsTowardLeaderboard : undefined,
    teamOneParticipantIds: match.teamOneParticipantIds,
    teamTwoParticipantIds: match.teamTwoParticipantIds,
    teamOneScore: match.teamOneScore,
    teamTwoScore: match.teamTwoScore,
  }));
}
