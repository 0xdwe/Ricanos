import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

let updated: any = null;
const match = {
  id: "match_1",
  eventId: "event_1",
  roundNumber: 1,
  courtNumber: 1,
  status: "scheduled",
  teamOneParticipantIds: ["adam", "alice"],
  teamTwoParticipantIds: ["lisa", "alex"],
};

vi.mock("@/features/matches/drizzle-match-store", () => ({
  createDrizzleMatchStore: () => ({
    getMatch: async () => match,
    updateParticipants: async (_id: string, input: any) => {
      updated = input;
      return { ...match, ...input };
    },
  }),
}));

vi.mock("@/features/players/drizzle-player-store", () => ({
  createDrizzlePlayerStore: () => ({
    listRoster: async () => ["adam", "alice", "lisa", "alex", "bruno"].map((playerId, index) => ({ playerId, sortOrder: index + 1 })),
  }),
}));

describe("replaceMatchParticipantFormAction", () => {
  it("replaces an unavailable player with another roster player for only that match", async () => {
    updated = null;
    const { replaceMatchParticipantForTest } = await import("./match-participant-actions");
    const formData = new FormData();
    formData.set("matchId", "match_1");
    formData.set("participantId", "alex");

    const result = await replaceMatchParticipantForTest("event_1", formData);

    expect(result.success).toBe(true);
    expect(updated).toEqual({
      teamOneParticipantIds: ["adam", "alice"],
      teamTwoParticipantIds: ["lisa", "bruno"],
    });
  });
});
