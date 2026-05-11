import type { MatchRecord } from "./match-model";
import type { CreateMatchInput, CreateRoundInput, MatchStore, RoundRecord, UpdateMatchInput } from "./match-store";

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
      const match = { id: id("match"), ...input, updatedAt: new Date("2026-01-01T00:00:00.000Z") };
      matches.set(match.id, match);
      return match;
    },
    async listMatches(eventId: string) {
      return [...matches.values()].filter((match) => match.eventId === eventId).sort((a, b) => a.roundNumber - b.roundNumber || a.courtNumber - b.courtNumber);
    },
    async getMatch(matchId: string) {
      return matches.get(matchId) ?? null;
    },
    async updateMatch(matchId: string, input: UpdateMatchInput) {
      const existing = matches.get(matchId);
      if (!existing) return null;
      const updated = { ...existing, ...input, updatedAt: input.updatedAt ?? new Date("2026-01-01T00:00:00.000Z") };
      matches.set(matchId, updated);
      return updated;
    },
  };
}
