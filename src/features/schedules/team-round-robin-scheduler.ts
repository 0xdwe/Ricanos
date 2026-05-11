export type ScheduleTeam = { id: string; displayName: string };
export type TeamRoundRobinMatch = { courtNumber: number; teamOneId: string; teamTwoId: string; manualOverride: boolean };
export type TeamRoundRobinRound = { roundNumber: number; matches: TeamRoundRobinMatch[]; byeTeamIds: string[] };
export type TeamRoundRobinSchedule = { seed: string; rounds: TeamRoundRobinRound[]; warnings: string[] };

function hashSeed(seed: string): number {
  return [...seed].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
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

export function generateTeamRoundRobinSchedule(input: { teams: ScheduleTeam[]; courtCount: number; roundCount: number; seed: string }): TeamRoundRobinSchedule {
  const warnings: string[] = [];
  if (input.teams.length < 2) warnings.push("Fixed-team round robin requires at least two teams.");
  const seededTeams = shuffle(input.teams, input.seed);
  const working: (ScheduleTeam | null)[] = seededTeams.length % 2 === 0 ? [...seededTeams] : [...seededTeams, null];
  const rounds: TeamRoundRobinRound[] = [];

  for (let roundIndex = 0; roundIndex < input.roundCount; roundIndex += 1) {
    const matches: TeamRoundRobinMatch[] = [];
    const byeTeamIds: string[] = [];
    const pairCount = Math.floor(working.length / 2);

    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      const teamOne = working[pairIndex];
      const teamTwo = working[working.length - 1 - pairIndex];
      if (!teamOne && teamTwo) byeTeamIds.push(teamTwo.id);
      if (teamOne && !teamTwo) byeTeamIds.push(teamOne.id);
      if (teamOne && teamTwo && matches.length < input.courtCount) {
        matches.push({ courtNumber: matches.length + 1, teamOneId: teamOne.id, teamTwoId: teamTwo.id, manualOverride: false });
      }
    }

    rounds.push({ roundNumber: roundIndex + 1, matches, byeTeamIds });
    const fixed = working[0];
    const rotating = working.slice(1);
    rotating.unshift(rotating.pop() ?? null);
    working.splice(0, working.length, fixed, ...rotating);
  }

  return { seed: input.seed, rounds, warnings };
}
