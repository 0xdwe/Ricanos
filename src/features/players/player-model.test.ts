import { describe, expect, it } from "vitest";
import {
  findDuplicatePlayerSuggestions,
  normalizePlayerName,
  parseMultilinePlayerList,
  validateRosterAdd,
} from "./player-model";

describe("player-model", () => {
  it("normalizes player names for matching while preserving display names separately", () => {
    expect(normalizePlayerName("  Alice   Tan  ")).toBe("alice tan");
    expect(normalizePlayerName("ÁLICE Tan")).toBe("alice tan");
  });

  it("parses multiline player lists and removes empty lines", () => {
    expect(parseMultilinePlayerList("Alice\n\n Bob \nCharlie")).toEqual([
      { displayName: "Alice", normalizedName: "alice" },
      { displayName: "Bob", normalizedName: "bob" },
      { displayName: "Charlie", normalizedName: "charlie" },
    ]);
  });

  it("deduplicates repeated names inside a pasted list", () => {
    expect(parseMultilinePlayerList("Alice\nalice\n ALICE  ")).toEqual([
      { displayName: "Alice", normalizedName: "alice" },
    ]);
  });

  it("suggests existing players with matching normalized names", () => {
    const suggestions = findDuplicatePlayerSuggestions(
      { displayName: " Alice Tan ", normalizedName: "alice tan" },
      [
        { id: "p1", displayName: "Alice Tan", normalizedName: "alice tan" },
        { id: "p2", displayName: "Bob Lim", normalizedName: "bob lim" },
      ],
    );

    expect(suggestions).toEqual([{ id: "p1", displayName: "Alice Tan", normalizedName: "alice tan" }]);
  });

  it("rejects adding the same player twice to an event roster", () => {
    expect(validateRosterAdd("p1", ["p1", "p2"])).toEqual({
      ok: false,
      errors: [{ field: "playerId", message: "Player is already on this event roster" }],
    });
  });
});
