import { eq } from "drizzle-orm";
import { createDb } from "@/lib/db";
import { players, teamPlayers, teams } from "@/lib/db/schema";
import { normalizePlayerName } from "@/features/players/player-model";
import type { TeamRecord, TeamStore, TeamStorePlayer } from "./team-store";

type Db = ReturnType<typeof createDb>;

function mapPlayer(row: typeof players.$inferSelect): TeamStorePlayer {
  return { id: row.id, displayName: row.displayName, normalizedName: row.normalizedName };
}

export function createDrizzleTeamStore(db: Db = createDb()): TeamStore {
  async function mapTeam(row: typeof teams.$inferSelect): Promise<TeamRecord> {
    const rows = await db.select().from(teamPlayers).where(eq(teamPlayers.teamId, row.id));
    return {
      id: row.id,
      eventId: row.eventId,
      displayName: row.displayName,
      playerIds: rows.sort((a, b) => a.sortOrder - b.sortOrder).map((player) => player.playerId),
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  return {
    async createOrFindPlayer(displayName) {
      const normalizedName = normalizePlayerName(displayName);
      const [existing] = await db.select().from(players).where(eq(players.normalizedName, normalizedName));
      if (existing) return mapPlayer(existing);
      const [created] = await db.insert(players).values({ displayName, normalizedName }).returning();
      return mapPlayer(created);
    },
    async createTeam(input) {
      const existing = await this.listTeams(input.eventId);
      const [team] = await db.insert(teams).values({ eventId: input.eventId, displayName: input.displayName, sortOrder: existing.length + 1 }).returning();
      await db.insert(teamPlayers).values([
        { teamId: team.id, playerId: input.playerIds[0], sortOrder: 1 },
        { teamId: team.id, playerId: input.playerIds[1], sortOrder: 2 },
      ]);
      return mapTeam(team);
    },
    async listTeams(eventId) {
      const rows = await db.select().from(teams).where(eq(teams.eventId, eventId));
      return Promise.all(rows.sort((a, b) => a.sortOrder - b.sortOrder).map(mapTeam));
    },
  };
}
