import type { MatchRecord, MatchStatus } from "./match-model";

export type CreateRoundInput = {
  eventId: string;
  roundNumber: number;
};

export type RoundRecord = CreateRoundInput & {
  id: string;
  createdAt: Date;
};

export type CreateMatchInput = Omit<MatchRecord, "id" | "updatedAt" | "status" | "teamOneScore" | "teamTwoScore" | "scoreOverrideWarning" | "abandonedCountsTowardLeaderboard"> & {
  roundId?: string | null;
  status?: MatchStatus;
  teamOneScore?: number | null;
  teamTwoScore?: number | null;
  scoreOverrideWarning?: string | null;
  abandonedCountsTowardLeaderboard?: boolean;
};

export type ScoreUpdateInput = Pick<MatchRecord, "teamOneScore" | "teamTwoScore" | "scoreOverrideWarning" | "status">;
export type StatusUpdateInput = Pick<MatchRecord, "status" | "abandonedCountsTowardLeaderboard">;
export type ParticipantUpdateInput = Pick<MatchRecord, "teamOneParticipantIds" | "teamTwoParticipantIds">;

export type MatchStore = {
  createRound(input: CreateRoundInput): Promise<RoundRecord>;
  createMatch(input: CreateMatchInput): Promise<MatchRecord>;
  listMatches(eventId: string): Promise<MatchRecord[]>;
  getMatch(id: string): Promise<MatchRecord | null>;
  updateScore(id: string, input: ScoreUpdateInput): Promise<MatchRecord | null>;
  updateStatus(id: string, input: StatusUpdateInput): Promise<MatchRecord | null>;
  updateParticipants(id: string, input: ParticipantUpdateInput): Promise<MatchRecord | null>;
};
