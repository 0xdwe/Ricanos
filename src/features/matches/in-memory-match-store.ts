import type { MatchRecord } from "./match-model";
import type { CreateMatchInput, CreateRoundInput, MatchStore, ParticipantUpdateInput, RoundRecord, ScoreUpdateInput, StatusUpdateInput } from "./match-store";

let nextId = 1;

function id(prefix: string) {
  const value = `${prefix}_${nextId}`;
  nextId += 1;
  return value;
}

export function createInMemoryMatchStore(initialMatches: MatchRecord[] = [], initialRounds: RoundRecord[] = []): MatchStore {
  const matches = new Map(initialMatches.map((match) => [match.id, match]));
  const rounds = new Map(initialRounds.map((round) => [round.id, round]));

  return {
    async createRound(input: CreateRoundInput) {
      const round = { id: id("round"), ...input, createdAt: new Date("2026-01-01T00:00:00.000Z") };
      rounds.set(round.id, round);
      return round;
    },
    async createMatch(input: CreateMatchInput) {
      const match: MatchRecord = {
        id: id("match"),
        ...input,
        status: input.status ?? "scheduled",
        teamOneScore: input.teamOneScore ?? null,
        teamTwoScore: input.teamTwoScore ?? null,
        scoreOverrideWarning: input.scoreOverrideWarning ?? null,
        abandonedCountsTowardLeaderboard: input.abandonedCountsTowardLeaderboard ?? false,
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      };
      matches.set(match.id, match);
      return match;
    },
    async listMatches(eventId: string) {
      return [...matches.values()].filter((match) => match.eventId === eventId).sort((a, b) => a.roundNumber - b.roundNumber || a.courtNumber - b.courtNumber);
    },
    async getMatch(matchId: string) {
      return matches.get(matchId) ?? null;
    },
    async updateScore(matchId: string, input: ScoreUpdateInput) {
      const existing = matches.get(matchId);
      if (!existing) return null;
      const updated = { ...existing, ...input, updatedAt: new Date("2026-01-01T00:00:00.000Z") };
      matches.set(matchId, updated);
      return updated;
    },
    async updateStatus(matchId: string, input: StatusUpdateInput) {
      const existing = matches.get(matchId);
      if (!existing) return null;
      const updated = { ...existing, ...input, updatedAt: new Date("2026-01-01T00:00:00.000Z") };
      matches.set(matchId, updated);
      return updated;
    },
    async updateParticipants(matchId: string, input: ParticipantUpdateInput) {
      const existing = matches.get(matchId);
      if (!existing) return null;
      const updated = { ...existing, ...input, updatedAt: new Date("2026-01-01T00:00:00.000Z") };
      matches.set(matchId, updated);
      return updated;
    },
  };
}
