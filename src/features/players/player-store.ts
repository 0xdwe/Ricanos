export type PlayerRecord = {
  id: string;
  displayName: string;
  normalizedName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EventPlayerRecord = {
  id: string;
  eventId: string;
  playerId: string;
  sortOrder: number;
  createdAt: Date;
};

export type PlayerStore = {
  createPlayer(input: { displayName: string; normalizedName: string }): Promise<PlayerRecord>;
  findPlayerByNormalizedName(normalizedName: string): Promise<PlayerRecord | null>;
  listPlayers(): Promise<PlayerRecord[]>;
  listRoster(eventId: string): Promise<EventPlayerRecord[]>;
  addPlayerToRoster(eventId: string, playerId: string): Promise<EventPlayerRecord>;
};
