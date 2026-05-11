export type SchedulePlayer = { id: string; displayName: string };
export type ScheduleMatch = { courtNumber: number; teamOnePlayerIds: [string, string]; teamTwoPlayerIds: [string, string]; manualOverride: boolean };
export type ScheduleRound = { roundNumber: number; matches: ScheduleMatch[] };
export type AmericanoSchedule = { seed: string; rounds: ScheduleRound[]; warnings: string[] };

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffle<T>(items: T[], seed: string): T[] {
  let state = hashSeed(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    const j = Math.abs(state) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

export function generateAmericanoSchedule(input: { players: SchedulePlayer[]; courtCount: number; roundCount: number; seed: string }): AmericanoSchedule {
  const capacity = input.courtCount * 4;
  const warnings: string[] = [];
  if (input.players.length < 4) warnings.push("Americano requires at least four players.");
  if (input.players.length % 4 !== 0) warnings.push("Americano individual rotation works best with player counts in multiples of four.");

  const partnerCounts = new Map<string, number>();
  const base = shuffle(input.players, input.seed);
  const rounds: ScheduleRound[] = [];

  for (let roundIndex = 0; roundIndex < input.roundCount; roundIndex += 1) {
    const rotated = base.map((_, index) => base[(index + roundIndex) % base.length]).slice(0, capacity);
    const matches: ScheduleMatch[] = [];

    for (let courtIndex = 0; courtIndex < input.courtCount; courtIndex += 1) {
      const group = rotated.slice(courtIndex * 4, courtIndex * 4 + 4);
      if (group.length < 4) continue;
      const teamOne: [string, string] = [group[0].id, group[3].id];
      const teamTwo: [string, string] = [group[1].id, group[2].id];
      for (const team of [teamOne, teamTwo]) {
        const key = pairKey(team[0], team[1]);
        const count = partnerCounts.get(key) ?? 0;
        if (count > 0) warnings.push(`Repeated partner pair: ${key}`);
        partnerCounts.set(key, count + 1);
      }
      matches.push({ courtNumber: courtIndex + 1, teamOnePlayerIds: teamOne, teamTwoPlayerIds: teamTwo, manualOverride: false });
    }

    rounds.push({ roundNumber: roundIndex + 1, matches });
  }

  return { seed: input.seed, rounds, warnings: [...new Set(warnings)] };
}
