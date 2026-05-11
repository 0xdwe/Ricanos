export type FairSelectionEntry = {
  id: string;
  displayName: string;
  rank: number;
  matchesPlayed: number;
  roundsSinceBye: number;
};

export type FairSelectionResult<T extends FairSelectionEntry> = {
  active: T[];
  byeIds: string[];
};

function fairnessCompare<T extends FairSelectionEntry>(a: T, b: T): number {
  return (
    a.matchesPlayed - b.matchesPlayed ||
    b.roundsSinceBye - a.roundsSinceBye ||
    a.rank - b.rank ||
    a.displayName.localeCompare(b.displayName)
  );
}

function rankCompare<T extends FairSelectionEntry>(a: T, b: T): number {
  return a.rank - b.rank || a.displayName.localeCompare(b.displayName);
}

export function selectFairActiveEntries<T extends FairSelectionEntry>(input: {
  entries: T[];
  activeCount: number;
  unavailableIds: string[];
  sortActiveByRank?: boolean;
}): FairSelectionResult<T> {
  const unavailable = new Set(input.unavailableIds);
  const unavailableEntries = input.entries.filter((entry) => unavailable.has(entry.id));
  const availableEntries = input.entries.filter((entry) => !unavailable.has(entry.id));
  const fairnessSorted = [...availableEntries].sort(fairnessCompare);
  const selected = fairnessSorted.slice(0, input.activeCount);
  const overflowByes = fairnessSorted.slice(input.activeCount);
  const active = input.sortActiveByRank ? [...selected].sort(rankCompare) : selected;

  return {
    active,
    byeIds: [...unavailableEntries, ...overflowByes].map((entry) => entry.id),
  };
}
