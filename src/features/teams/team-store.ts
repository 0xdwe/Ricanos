export type TeamPlayerRecord = { playerId: string; sortOrder: number };
export type TeamRecord = {
  id: string;
  eventId: string;
  displayName: string;
  playerIds: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};
export type TeamStorePlayer = { id: string; displayName: string; normalizedName: string };

export type TeamStore = {
  createOrFindPlayer(displayName: string): Promise<TeamStorePlayer>;
  createTeam(input: { eventId: string; displayName: string; playerIds: [string, string] }): Promise<TeamRecord>;
  listTeams(eventId: string): Promise<TeamRecord[]>;
};
