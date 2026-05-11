export type RankedTeam = { id: string; displayName: string; rank: number };
export type MexicanoTeamMatch = { courtNumber: number; teamOneId: string; teamTwoId: string; manualOverride: boolean };
export type MexicanoTeamRound = { roundNumber: number; matches: MexicanoTeamMatch[]; byeTeamIds: string[] };

export function generateMexicanoTeamRound(input: { teams: RankedTeam[]; courtCount: number; roundNumber: number }): MexicanoTeamRound {
  const sorted = [...input.teams].sort((a, b) => a.rank - b.rank || a.displayName.localeCompare(b.displayName));
  const active = sorted.slice(0, input.courtCount * 2);
  const byeTeamIds = sorted.slice(input.courtCount * 2).map((team) => team.id);
  const matches: MexicanoTeamMatch[] = [];

  for (let courtIndex = 0; courtIndex < input.courtCount; courtIndex += 1) {
    const pair = active.slice(courtIndex * 2, courtIndex * 2 + 2);
    if (pair.length < 2) continue;
    matches.push({ courtNumber: courtIndex + 1, teamOneId: pair[0].id, teamTwoId: pair[1].id, manualOverride: false });
  }

  return { roundNumber: input.roundNumber, matches, byeTeamIds };
}
