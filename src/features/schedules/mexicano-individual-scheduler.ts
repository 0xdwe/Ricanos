import { selectFairActiveEntries, type FairSelectionEntry } from "./active-selection";

export type RankedPlayer = { id: string; displayName: string; rank: number; matchesPlayed?: number; roundsSinceBye?: number };
export type MexicanoIndividualMatch = { courtNumber: number; teamOnePlayerIds: [string, string]; teamTwoPlayerIds: [string, string]; manualOverride: boolean };
export type MexicanoIndividualRound = { roundNumber: number; matches: MexicanoIndividualMatch[]; byePlayerIds: string[] };

type SelectablePlayer = RankedPlayer & FairSelectionEntry;

function selectablePlayer(player: RankedPlayer): SelectablePlayer {
  return {
    ...player,
    matchesPlayed: player.matchesPlayed ?? 0,
    roundsSinceBye: player.roundsSinceBye ?? 0,
  };
}

export function generateMexicanoIndividualRound(input: {
  players: RankedPlayer[];
  courtCount: number;
  roundNumber: number;
  unavailablePlayerIds?: string[];
}): MexicanoIndividualRound {
  const selectable = input.players.map(selectablePlayer);
  const hasFairnessData = input.players.some((player) => player.matchesPlayed !== undefined || player.roundsSinceBye !== undefined) || (input.unavailablePlayerIds?.length ?? 0) > 0;
  const selected = hasFairnessData
    ? selectFairActiveEntries({ entries: selectable, activeCount: input.courtCount * 4, unavailableIds: input.unavailablePlayerIds ?? [], sortActiveByRank: true })
    : {
        active: [...selectable].sort((a, b) => a.rank - b.rank || a.displayName.localeCompare(b.displayName)).slice(0, input.courtCount * 4),
        byeIds: [...selectable].sort((a, b) => a.rank - b.rank || a.displayName.localeCompare(b.displayName)).slice(input.courtCount * 4).map((player) => player.id),
      };
  const active = selected.active;
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

  return { roundNumber: input.roundNumber, matches, byePlayerIds: selected.byeIds };
}
