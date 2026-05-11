import type { MatchRecord } from "./match-model";

export type CreateRoundInput = {
  eventId: string;
  roundNumber: number;
};

export type RoundRecord = CreateRoundInput & {
  id: string;
  createdAt: Date;
};

export type CreateMatchInput = Omit<MatchRecord, "id" | "updatedAt">;
export type UpdateMatchInput = Partial<Omit<MatchRecord, "id" | "eventId">>;

export type MatchStore = {
  createRound(input: CreateRoundInput): Promise<RoundRecord>;
  createMatch(input: CreateMatchInput): Promise<MatchRecord>;
  listMatches(eventId: string): Promise<MatchRecord[]>;
  getMatch(id: string): Promise<MatchRecord | null>;
  updateMatch(id: string, input: UpdateMatchInput): Promise<MatchRecord | null>;
};
