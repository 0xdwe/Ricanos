import { selectFairActiveEntries, type FairSelectionEntry } from "./active-selection";

export type RankedTeam = { id: string; displayName: string; rank: number; matchesPlayed?: number; roundsSinceBye?: number };
export type MexicanoTeamMatch = { courtNumber: number; teamOneId: string; teamTwoId: string; manualOverride: boolean };
export type MexicanoTeamRound = { roundNumber: number; matches: MexicanoTeamMatch[]; byeTeamIds: string[] };

type SelectableTeam = RankedTeam & FairSelectionEntry;

function selectableTeam(team: RankedTeam): SelectableTeam {
  return {
    ...team,
    matchesPlayed: team.matchesPlayed ?? 0,
    roundsSinceBye: team.roundsSinceBye ?? 0,
  };
}

export function generateMexicanoTeamRound(input: {
  teams: RankedTeam[];
  courtCount: number;
  roundNumber: number;
  unavailableTeamIds?: string[];
}): MexicanoTeamRound {
  const selectable = input.teams.map(selectableTeam);
  const hasFairnessData = input.teams.some((team) => team.matchesPlayed !== undefined || team.roundsSinceBye !== undefined) || (input.unavailableTeamIds?.length ?? 0) > 0;
  const selected = hasFairnessData
    ? selectFairActiveEntries({ entries: selectable, activeCount: input.courtCount * 2, unavailableIds: input.unavailableTeamIds ?? [], sortActiveByRank: true })
    : {
        active: [...selectable].sort((a, b) => a.rank - b.rank || a.displayName.localeCompare(b.displayName)).slice(0, input.courtCount * 2),
        byeIds: [...selectable].sort((a, b) => a.rank - b.rank || a.displayName.localeCompare(b.displayName)).slice(input.courtCount * 2).map((team) => team.id),
      };
  const active = selected.active;
  const matches: MexicanoTeamMatch[] = [];

  for (let courtIndex = 0; courtIndex < input.courtCount; courtIndex += 1) {
    const pair = active.slice(courtIndex * 2, courtIndex * 2 + 2);
    if (pair.length < 2) continue;
    matches.push({ courtNumber: courtIndex + 1, teamOneId: pair[0].id, teamTwoId: pair[1].id, manualOverride: false });
  }

  return { roundNumber: input.roundNumber, matches, byeTeamIds: selected.byeIds };
}
