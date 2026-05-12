import { eq } from "drizzle-orm";
import { createDb } from "@/lib/db";
import { matches, rounds } from "@/lib/db/schema";
import type { MatchRecord } from "./match-model";
import type { CreateMatchInput, CreateRoundInput, MatchStore, ParticipantUpdateInput, RoundRecord, ScoreUpdateInput, StatusUpdateInput } from "./match-store";

type Db = ReturnType<typeof createDb>;

function mapMatch(row: typeof matches.$inferSelect): MatchRecord {
  return {
    id: row.id,
    eventId: row.eventId,
    roundId: row.roundId,
    roundNumber: row.roundNumber,
    courtNumber: row.courtNumber,
    status: row.status,
    teamOneParticipantIds: row.teamOneParticipantIds,
    teamTwoParticipantIds: row.teamTwoParticipantIds,
    teamOneScore: row.teamOneScore,
    teamTwoScore: row.teamTwoScore,
    scoreTarget: row.scoreTarget,
    scoreOverrideWarning: row.scoreOverrideWarning,
    abandonedCountsTowardLeaderboard: row.abandonedCountsTowardLeaderboard,
    updatedAt: row.updatedAt,
  };
}

function mapRound(row: typeof rounds.$inferSelect): RoundRecord {
  return { id: row.id, eventId: row.eventId, roundNumber: row.roundNumber, createdAt: row.createdAt };
}

export function createDrizzleMatchStore(db: Db = createDb()): MatchStore {
  return {
    async createRound(input: CreateRoundInput) {
      const [round] = await db.insert(rounds).values(input).returning();
      return mapRound(round);
    },
    async createMatch(input: CreateMatchInput) {
      const [match] = await db.insert(matches).values(input).returning();
      return mapMatch(match);
    },
    async listMatches(eventId: string) {
      const rows = await db.select().from(matches).where(eq(matches.eventId, eventId));
      return rows.map(mapMatch).sort((a, b) => a.roundNumber - b.roundNumber || a.courtNumber - b.courtNumber);
    },
    async getMatch(id: string) {
      const [row] = await db.select().from(matches).where(eq(matches.id, id));
      return row ? mapMatch(row) : null;
    },
    async updateScore(id: string, input: ScoreUpdateInput) {
      const [row] = await db.update(matches).set({ ...input, updatedAt: new Date() }).where(eq(matches.id, id)).returning();
      return row ? mapMatch(row) : null;
    },
    async updateStatus(id: string, input: StatusUpdateInput) {
      const [row] = await db.update(matches).set({ ...input, updatedAt: new Date() }).where(eq(matches.id, id)).returning();
      return row ? mapMatch(row) : null;
    },
    async updateParticipants(id: string, input: ParticipantUpdateInput) {
      const [row] = await db.update(matches).set({ ...input, updatedAt: new Date() }).where(eq(matches.id, id)).returning();
      return row ? mapMatch(row) : null;
    },
  };
}
