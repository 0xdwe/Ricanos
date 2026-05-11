import { describe, expect, it } from "vitest";
import { createTeamDisplayName, parseFixedTeamLines, validateFixedTeamPlayers } from "./team-model";

describe("team-model", () => {
  it("parses fixed-team paste lines", () => {
    expect(parseFixedTeamLines("Alice / Bob\nCharlie/Dana")).toEqual({
      ok: true,
      teams: [
        { playerOneName: "Alice", playerTwoName: "Bob", displayName: "Alice / Bob" },
        { playerOneName: "Charlie", playerTwoName: "Dana", displayName: "Charlie / Dana" },
      ],
    });
  });

  it("reports invalid fixed-team lines", () => {
    expect(parseFixedTeamLines("Alice\nBob / Carol / Dan")).toEqual({
      ok: false,
      errors: [
        { line: 1, message: "Team line must contain exactly two player names separated by /" },
        { line: 2, message: "Team line must contain exactly two player names separated by /" },
      ],
    });
  });

  it("creates display names from player names", () => {
    expect(createTeamDisplayName(" Alice ", " Bob ")).toBe("Alice / Bob");
  });

  it("rejects a team using the same player twice", () => {
    expect(validateFixedTeamPlayers("p1", "p1")).toEqual({
      ok: false,
      errors: [{ field: "playerTwoId", message: "A fixed team must contain two different players" }],
    });
  });
});
