import type { MatchRecord, MatchStatus } from "@/features/matches/match-model";

export type RiskWarningCode =
  | "live_match_player_change"
  | "duplicate_participant"
  | "wrong_player_count"
  | "court_conflict"
  | "fixed_team_violation"
  | "score_target_mismatch";

export type RiskWarning = {
  code: RiskWarningCode;
  message: string;
  matchId?: string;
  roundNumber?: number;
  courtNumber?: number;
};

export type RiskValidationResult = {
  warnings: RiskWarning[];
  requiresConfirmation: boolean;
  canSave: boolean;
};

export type RiskMatch = Pick<MatchRecord, "id" | "roundNumber" | "courtNumber" | "status" | "teamOneParticipantIds" | "teamTwoParticipantIds" | "scoreTarget"> & {
  teamOneScore?: number | null;
  teamTwoScore?: number | null;
};

export type FixedTeam = { id: string; playerIds: string[] };

export function validateRiskyAdminChanges(input: {
  matches: RiskMatch[];
  originalMatches?: RiskMatch[];
  eventStatus?: "draft" | "ready" | "live" | "completed" | "archived";
  pairingMode?: "individual" | "fixed_team";
  fixedTeams?: FixedTeam[];
  overrideConfirmed?: boolean;
}): RiskValidationResult {
  const warnings: RiskWarning[] = [];
  const originalById = new Map((input.originalMatches ?? []).map((match) => [match.id, match]));

  for (const match of input.matches) {
    const participants = [...match.teamOneParticipantIds, ...match.teamTwoParticipantIds];
    const uniqueParticipants = new Set(participants);

    if (uniqueParticipants.size !== participants.length) {
      warnings.push({ code: "duplicate_participant", message: "A participant appears more than once in the same match", matchId: match.id, roundNumber: match.roundNumber, courtNumber: match.courtNumber });
    }

    if (participants.length !== 4 || match.teamOneParticipantIds.length !== 2 || match.teamTwoParticipantIds.length !== 2) {
      warnings.push({ code: "wrong_player_count", message: "A padel match should have two participants per team and four participants total", matchId: match.id, roundNumber: match.roundNumber, courtNumber: match.courtNumber });
    }

    if (typeof match.teamOneScore === "number" && typeof match.teamTwoScore === "number") {
      const total = match.teamOneScore + match.teamTwoScore;
      if (total !== match.scoreTarget) {
        warnings.push({ code: "score_target_mismatch", message: `Score total ${total} does not match target ${match.scoreTarget}`, matchId: match.id, roundNumber: match.roundNumber, courtNumber: match.courtNumber });
      }
    }

    const original = originalById.get(match.id);
    if (input.eventStatus === "live" && original && isLiveStatus(original.status) && participantsChanged(original, match)) {
      warnings.push({ code: "live_match_player_change", message: "Changing players in a live or in-progress match requires confirmation", matchId: match.id, roundNumber: match.roundNumber, courtNumber: match.courtNumber });
    }

    if (input.pairingMode === "fixed_team" && input.fixedTeams?.length) {
      const validTeams = new Set(input.fixedTeams.map((team) => stableKey(team.playerIds)));
      if (!validTeams.has(stableKey(match.teamOneParticipantIds)) || !validTeams.has(stableKey(match.teamTwoParticipantIds))) {
        warnings.push({ code: "fixed_team_violation", message: "Fixed-team matches must keep registered teammates together", matchId: match.id, roundNumber: match.roundNumber, courtNumber: match.courtNumber });
      }
    }
  }

  for (const group of groupByRound(input.matches).values()) {
    const seenCourts = new Map<number, string>();
    for (const match of group) {
      const existing = seenCourts.get(match.courtNumber);
      if (existing) {
        warnings.push({ code: "court_conflict", message: `Court ${match.courtNumber} is assigned to multiple matches in round ${match.roundNumber}`, matchId: match.id, roundNumber: match.roundNumber, courtNumber: match.courtNumber });
      } else {
        seenCourts.set(match.courtNumber, match.id);
      }
    }
  }

  return { warnings, requiresConfirmation: warnings.length > 0, canSave: warnings.length === 0 || input.overrideConfirmed === true };
}

function isLiveStatus(status: MatchStatus) {
  return status === "scheduled" || status === "in_progress";
}

function participantsChanged(a: RiskMatch, b: RiskMatch) {
  return stableKey([...a.teamOneParticipantIds, ...a.teamTwoParticipantIds]) !== stableKey([...b.teamOneParticipantIds, ...b.teamTwoParticipantIds]);
}

function stableKey(values: string[]) {
  return [...values].sort().join("|");
}

function groupByRound(matches: RiskMatch[]) {
  const groups = new Map<number, RiskMatch[]>();
  for (const match of matches) groups.set(match.roundNumber, [...(groups.get(match.roundNumber) ?? []), match]);
  return groups;
}
