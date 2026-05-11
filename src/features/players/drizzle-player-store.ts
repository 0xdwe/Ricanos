import { eq } from "drizzle-orm";
import { createDb } from "@/lib/db";
import { eventPlayers, players } from "@/lib/db/schema";
import type { EventPlayerRecord, PlayerRecord, PlayerStore } from "./player-store";

type Db = ReturnType<typeof createDb>;

function mapPlayer(row: typeof players.$inferSelect): PlayerRecord {
  return { id: row.id, displayName: row.displayName, normalizedName: row.normalizedName, createdAt: row.createdAt, updatedAt: row.updatedAt };
}

function mapEventPlayer(row: typeof eventPlayers.$inferSelect): EventPlayerRecord {
  return { id: row.id, eventId: row.eventId, playerId: row.playerId, sortOrder: row.sortOrder, createdAt: row.createdAt };
}

export function createDrizzlePlayerStore(db: Db = createDb()): PlayerStore {
  return {
    async createPlayer(input) {
      const [row] = await db.insert(players).values(input).returning();
      return mapPlayer(row);
    },
    async findPlayerByNormalizedName(normalizedName) {
      const [row] = await db.select().from(players).where(eq(players.normalizedName, normalizedName));
      return row ? mapPlayer(row) : null;
    },
    async listPlayers() {
      const rows = await db.select().from(players);
      return rows.map(mapPlayer).sort((a, b) => a.displayName.localeCompare(b.displayName));
    },
    async listRoster(eventId) {
      const rows = await db.select().from(eventPlayers).where(eq(eventPlayers.eventId, eventId));
      return rows.map(mapEventPlayer).sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async addPlayerToRoster(eventId, playerId) {
      const existing = await this.listRoster(eventId);
      const [row] = await db.insert(eventPlayers).values({ eventId, playerId, sortOrder: existing.length + 1 }).returning();
      return mapEventPlayer(row);
    },
  };
}
