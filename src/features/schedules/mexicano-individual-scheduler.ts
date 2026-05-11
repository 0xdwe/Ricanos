export type RankedPlayer = { id: string; displayName: string; rank: number };
export type MexicanoIndividualMatch = { courtNumber: number; teamOnePlayerIds: [string, string]; teamTwoPlayerIds: [string, string]; manualOverride: boolean };
export type MexicanoIndividualRound = { roundNumber: number; matches: MexicanoIndividualMatch[]; byePlayerIds: string[] };

export function generateMexicanoIndividualRound(input: { players: RankedPlayer[]; courtCount: number; roundNumber: number }): MexicanoIndividualRound {
  const sorted = [...input.players].sort((a, b) => a.rank - b.rank || a.displayName.localeCompare(b.displayName));
  const active = sorted.slice(0, input.courtCount * 4);
  const byePlayerIds = sorted.slice(input.courtCount * 4).map((player) => player.id);
  const matches: MexicanoIndividualMatch[] = [];

  for (let courtIndex = 0; courtIndex < input.courtCount; courtIndex += 1) {
    const group = active.slice(courtIndex * 4, courtIndex * 4 + 4);
    if (group.length < 4) continue;
    matches.push({
      courtNumber: courtIndex + 1,
      teamOnePlayerIds: [group[0].id, group[3].id],
      teamTwoPlayerIds: [group[1].id, group[2].id],
      manualOverride: false,
    });
  }

  return { roundNumber: input.roundNumber, matches, byePlayerIds };
}
