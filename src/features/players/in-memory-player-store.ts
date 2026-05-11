import type { EventPlayerRecord, PlayerRecord, PlayerStore } from "./player-store";

let nextId = 1;
function id(prefix: string) {
  const value = `${prefix}_${nextId}`;
  nextId += 1;
  return value;
}

export function createInMemoryPlayerStore(): PlayerStore {
  const players = new Map<string, PlayerRecord>();
  const roster = new Map<string, EventPlayerRecord[]>();

  return {
    async createPlayer(input) {
      const now = new Date("2026-01-01T00:00:00.000Z");
      const player = { id: id("player"), ...input, createdAt: now, updatedAt: now };
      players.set(player.id, player);
      return player;
    },
    async findPlayerByNormalizedName(normalizedName) {
      return [...players.values()].find((player) => player.normalizedName === normalizedName) ?? null;
    },
    async listPlayers() {
      return [...players.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
    },
    async listRoster(eventId) {
      return roster.get(eventId) ?? [];
    },
    async addPlayerToRoster(eventId, playerId) {
      const existing = roster.get(eventId) ?? [];
      const record = { id: id("event_player"), eventId, playerId, sortOrder: existing.length + 1, createdAt: new Date("2026-01-01T00:00:00.000Z") };
      roster.set(eventId, [...existing, record]);
      return record;
    },
  };
}
