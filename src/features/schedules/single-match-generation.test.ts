import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let mockEvent: any;
let mockRoster: any[];
let mockPlayers: any[];
let mockMatches: any[];
let mockTeams: any[];
let createdMatches: any[] = [];

vi.mock("@/features/events/drizzle-event-store", () => ({
  createDrizzleEventStore: () => ({
    getEvent: async () => mockEvent,
    updateEvent: vi.fn(),
    updateStatus: vi.fn(),
  }),
}));

vi.mock("@/features/players/drizzle-player-store", () => ({
  createDrizzlePlayerStore: () => ({
    listRoster: async () => mockRoster,
    listPlayers: async () => mockPlayers,
  }),
}));

vi.mock("@/features/matches/drizzle-match-store", () => ({
  createDrizzleMatchStore: () => ({
    listMatches: async () => mockMatches,
    createRound: async ({ roundNumber }: any) => ({ id: `round_${roundNumber}`, roundNumber }),
    createMatch: async (match: any) => {
      createdMatches.push(match);
      return { id: `match_${createdMatches.length}` };
    },
  }),
}));

vi.mock("@/features/teams/drizzle-team-store", () => ({
  createDrizzleTeamStore: () => ({
    listTeams: async () => mockTeams,
  }),
}));

vi.mock("@/features/audit/drizzle-audit-log-store", () => ({ 
  createDrizzleAuditLogStore: () => ({ create: vi.fn() }) 
}));

vi.mock("@/features/audit/audit-log", () => ({ 
  recordAuditEntry: vi.fn() 
}));

import { generateSingleMatchAction } from "@/features/schedules/schedule-form-actions";

describe("generateSingleMatchAction", () => {
  beforeEach(() => {
    createdMatches = [];
    mockMatches = [];
    mockTeams = [];
  });

  it("generates Americano individual match", async () => {
    mockEvent = {
      id: "event_1",
      format: "americano",
      pairingMode: "individual",
      status: "draft",
    };
    mockRoster = [
      { playerId: "p1" },
      { playerId: "p2" },
      { playerId: "p3" },
      { playerId: "p4" },
    ];
    mockPlayers = [
      { id: "p1", displayName: "Alice" },
      { id: "p2", displayName: "Ben" },
      { id: "p3", displayName: "Carla" },
      { id: "p4", displayName: "Dion" },
    ];

    const result = await generateSingleMatchAction("event_1");
    
    console.log("Result:", result);
    console.log("Created matches:", createdMatches);
    
    expect(result.success).toBe(true);
    expect(createdMatches).toHaveLength(1);
  });

  it("generates Mexicano individual match", async () => {
    mockEvent = {
      id: "event_1",
      format: "mexicano",
      pairingMode: "individual",
      status: "draft",
    };
    mockRoster = [
      { playerId: "p1" },
      { playerId: "p2" },
      { playerId: "p3" },
      { playerId: "p4" },
    ];
    mockPlayers = [
      { id: "p1", displayName: "Alice" },
      { id: "p2", displayName: "Ben" },
      { id: "p3", displayName: "Carla" },
      { id: "p4", displayName: "Dion" },
    ];

    const result = await generateSingleMatchAction("event_1");
    
    console.log("Result:", result);
    console.log("Created matches:", createdMatches);
    
    expect(result.success).toBe(true);
    expect(createdMatches).toHaveLength(1);
  });

  it("generates Mexicano fixed-team match", async () => {
    mockEvent = {
      id: "event_1",
      format: "mexicano",
      pairingMode: "fixed_team",
      status: "draft",
    };
    mockRoster = [];
    mockPlayers = [];
    mockTeams = [
      { id: "t1", displayName: "Team A" },
      { id: "t2", displayName: "Team B" },
    ];

    const result = await generateSingleMatchAction("event_1");
    
    console.log("Result:", result);
    console.log("Created matches:", createdMatches);
    
    expect(result.success).toBe(true);
    expect(createdMatches).toHaveLength(1);
  });

  it("generates Americano fixed-team match", async () => {
    mockEvent = {
      id: "event_1",
      format: "americano",
      pairingMode: "fixed_team",
      status: "draft",
    };
    mockRoster = [];
    mockPlayers = [];
    mockTeams = [
      { id: "t1", displayName: "Team A" },
      { id: "t2", displayName: "Team B" },
    ];

    const result = await generateSingleMatchAction("event_1");
    
    console.log("Result:", result);
    console.log("Created matches:", createdMatches);
    
    expect(result.success).toBe(true);
    expect(createdMatches).toHaveLength(1);
  });
});
