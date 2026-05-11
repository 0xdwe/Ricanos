import { describe, expect, it } from "vitest";
import { createFixedTeamAction, importFixedTeamsAction } from "./team-actions";
import { createInMemoryTeamStore } from "./in-memory-team-store";

describe("team actions", () => {
  it("creates a fixed team with exactly two players", async () => {
    const store = createInMemoryTeamStore();
    const result = await createFixedTeamAction(store, "event_1", "p1", "Alice", "p2", "Bob");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.team.displayName).toBe("Alice / Bob");
      expect(result.team.playerIds).toEqual(["p1", "p2"]);
    }
  });

  it("rejects duplicate player inside a fixed team", async () => {
    const store = createInMemoryTeamStore();
    await expect(createFixedTeamAction(store, "event_1", "p1", "Alice", "p1", "Alice")).resolves.toEqual({
      ok: false,
      errors: [{ field: "playerTwoId", message: "A fixed team must contain two different players" }],
    });
  });

  it("imports pasted fixed teams", async () => {
    const store = createInMemoryTeamStore();
    const result = await importFixedTeamsAction(store, "event_1", "Alice / Bob\nCharlie / Dana");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.teams.map((team) => team.displayName)).toEqual(["Alice / Bob", "Charlie / Dana"]);
      expect(result.createdPlayers.map((player) => player.displayName)).toEqual(["Alice", "Bob", "Charlie", "Dana"]);
    }
  });
});
