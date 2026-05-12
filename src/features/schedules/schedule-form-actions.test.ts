import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const createdMatches: Array<{ roundNumber: number; courtNumber: number }> = [];
let existingMatchCount = 0;

vi.mock("@/features/events/drizzle-event-store", () => ({
  createDrizzleEventStore: () => ({
    getEvent: async () => ({
      id: "event_1",
      name: "Friday Americano",
      format: "americano",
      pairingMode: "individual",
      courtCount: 1,
      roundCount: 2,
      scoreTarget: 32,
    }),
    updateEvent: vi.fn(),
    updateStatus: vi.fn(),
  }),
}));

vi.mock("@/features/players/drizzle-player-store", () => ({
  createDrizzlePlayerStore: () => ({
    listRoster: async () => [
      { playerId: "p1" },
      { playerId: "p2" },
      { playerId: "p3" },
      { playerId: "p4" },
    ],
    listPlayers: async () => [
      { id: "p1", displayName: "Alice" },
      { id: "p2", displayName: "Ben" },
      { id: "p3", displayName: "Carla" },
      { id: "p4", displayName: "Dion" },
    ],
  }),
}));

vi.mock("@/features/matches/drizzle-match-store", () => ({
  createDrizzleMatchStore: () => ({
    listMatches: async () => Array.from({ length: existingMatchCount }, (_, index) => ({ id: `m${index}` })),
    createRound: async ({ roundNumber }: { roundNumber: number }) => ({ id: `round_${roundNumber}`, roundNumber }),
    createMatch: async ({ roundNumber, courtNumber }: { roundNumber: number; courtNumber: number }) => {
      createdMatches.push({ roundNumber, courtNumber });
      return {};
    },
  }),
}));

vi.mock("@/features/audit/drizzle-audit-log-store", () => ({ createDrizzleAuditLogStore: () => ({ create: vi.fn() }) }));
vi.mock("@/features/audit/audit-log", () => ({ recordAuditEntry: vi.fn() }));

import { generateScheduleFormAction } from "./schedule-form-actions";

describe("generateScheduleFormAction", () => {
  it("previews six matches by default even when event roundCount is smaller", async () => {
    const formData = new FormData();
    formData.set("action", "preview");
    formData.set("seed", "seed");

    const result = await generateScheduleFormAction("event_1", null, formData);

    expect(result.preview?.rounds.flatMap((round: any) => round.matches)).toHaveLength(6);
  });

  it("appends the next six matches when saving after existing matches", async () => {
    existingMatchCount = 2;
    createdMatches.length = 0;
    const formData = new FormData();
    formData.set("action", "save");
    formData.set("scheduleData", JSON.stringify({
      seed: "seed",
      warnings: [],
      rounds: Array.from({ length: 6 }, (_, index) => ({
        roundNumber: index + 3,
        matches: [{ courtNumber: 1, teamOnePlayerIds: ["p1", "p2"], teamTwoPlayerIds: ["p3", "p4"], manualOverride: false }],
      })),
    }));

    const result = await generateScheduleFormAction("event_1", null, formData);

    expect(result.saved).toBe(true);
    expect(createdMatches).toHaveLength(6);
    expect(createdMatches[0].roundNumber).toBe(3);
  });
});
