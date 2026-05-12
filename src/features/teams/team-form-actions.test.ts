import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const teams: any[] = [];

vi.mock("@/features/teams/drizzle-team-store", () => ({
  createDrizzleTeamStore: () => ({
    createOrFindPlayer: async (displayName: string) => ({ id: displayName.toLowerCase(), displayName, normalizedName: displayName.toLowerCase() }),
    createTeam: async (input: any) => {
      teams.push(input);
      return input;
    },
  }),
}));

import { bulkAddTeamsFormAction } from "./team-form-actions";

describe("bulkAddTeamsFormAction", () => {
  it("creates player pairs from pasted team lines", async () => {
    teams.length = 0;
    const formData = new FormData();
    formData.set("teams", "Alice / Bob\nCarla, Dion");

    const result = await bulkAddTeamsFormAction("event_1", null, formData);

    expect(result.success).toBe(true);
    expect(teams).toEqual([
      { eventId: "event_1", displayName: "Alice / Bob", playerIds: ["alice", "bob"] },
      { eventId: "event_1", displayName: "Carla / Dion", playerIds: ["carla", "dion"] },
    ]);
  });

  it("rejects lines without exactly two players", async () => {
    const formData = new FormData();
    formData.set("teams", "Alice / Bob / Carla");

    const result = await bulkAddTeamsFormAction("event_1", null, formData);

    expect(result.error).toContain("exactly 2 players");
  });
});
