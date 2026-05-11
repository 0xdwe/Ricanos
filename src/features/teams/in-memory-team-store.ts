import { normalizePlayerName } from "@/features/players/player-model";
import type { TeamRecord, TeamStore, TeamStorePlayer } from "./team-store";

let nextId = 1;
function id(prefix: string) {
  const value = `${prefix}_${nextId}`;
  nextId += 1;
  return value;
}

export function createInMemoryTeamStore(): TeamStore {
  const players = new Map<string, TeamStorePlayer>();
  const teams = new Map<string, TeamRecord[]>();

  return {
    async createOrFindPlayer(displayName) {
      const normalizedName = normalizePlayerName(displayName);
      const existing = [...players.values()].find((player) => player.normalizedName === normalizedName);
      if (existing) return existing;
      const player = { id: id("player"), displayName, normalizedName };
      players.set(player.id, player);
      return player;
    },
    async createTeam(input) {
      const existing = teams.get(input.eventId) ?? [];
      const now = new Date("2026-01-01T00:00:00.000Z");
      const team = { id: id("team"), eventId: input.eventId, displayName: input.displayName, playerIds: [...input.playerIds], sortOrder: existing.length + 1, createdAt: now, updatedAt: now };
      teams.set(input.eventId, [...existing, team]);
      return team;
    },
    async listTeams(eventId) {
      return teams.get(eventId) ?? [];
    },
  };
}
