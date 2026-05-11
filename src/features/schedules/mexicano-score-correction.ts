import type { MatchRecord } from "@/features/matches/match-model";

export const mexicanoScoreCorrectionChoices = ["update_score_only", "update_score_and_regenerate_unplayed_future_rounds"] as const;
export type MexicanoScoreCorrectionChoice = (typeof mexicanoScoreCorrectionChoices)[number];

export type MexicanoScoreCorrectionPlan = {
  requiresChoice: boolean;
  availableChoices: MexicanoScoreCorrectionChoice[];
  futureRoundNumbers: number[];
  safeToRegenerateMatchIds: string[];
  protectedMatchIds: string[];
};

export function planMexicanoScoreCorrection(input: { editedRoundNumber: number; matches: MatchRecord[] }): MexicanoScoreCorrectionPlan {
  const futureMatches = input.matches
    .filter((match) => match.roundNumber > input.editedRoundNumber)
    .sort((a, b) => a.roundNumber - b.roundNumber || a.courtNumber - b.courtNumber || a.id.localeCompare(b.id));
  const futureRoundNumbers = [...new Set(futureMatches.map((match) => match.roundNumber))];
  const safeToRegenerateMatchIds: string[] = [];
  const protectedMatchIds: string[] = [];

  for (const match of futureMatches) {
    if (isScheduledAndUnscored(match)) {
      safeToRegenerateMatchIds.push(match.id);
    } else {
      protectedMatchIds.push(match.id);
    }
  }

  return {
    requiresChoice: futureMatches.length > 0,
    availableChoices: futureMatches.length > 0 ? [...mexicanoScoreCorrectionChoices] : ["update_score_only"],
    futureRoundNumbers,
    safeToRegenerateMatchIds,
    protectedMatchIds,
  };
}

function isScheduledAndUnscored(match: MatchRecord) {
  return match.status === "scheduled" && match.teamOneScore === null && match.teamTwoScore === null;
}
