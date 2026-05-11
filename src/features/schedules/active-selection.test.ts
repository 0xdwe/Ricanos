import { describe, expect, it } from "vitest";
import { selectFairActiveEntries } from "./active-selection";

describe("selectFairActiveEntries", () => {
  const entries = [
    { id: "p1", displayName: "Alice", rank: 1, matchesPlayed: 3, roundsSinceBye: 1 },
    { id: "p2", displayName: "Bob", rank: 2, matchesPlayed: 2, roundsSinceBye: 3 },
    { id: "p3", displayName: "Charlie", rank: 3, matchesPlayed: 2, roundsSinceBye: 1 },
    { id: "p4", displayName: "Dana", rank: 4, matchesPlayed: 1, roundsSinceBye: 0 },
    { id: "p5", displayName: "Eli", rank: 5, matchesPlayed: 2, roundsSinceBye: 5 },
  ];

  it("selects active entries by fewest matches, longest since bye, then rank", () => {
    const result = selectFairActiveEntries({ entries, activeCount: 4, unavailableIds: [] });
    expect(result.active.map((entry) => entry.id)).toEqual(["p4", "p5", "p2", "p3"]);
    expect(result.byeIds).toEqual(["p1"]);
  });

  it("respects manual rest/unavailable flags first", () => {
    const result = selectFairActiveEntries({ entries, activeCount: 4, unavailableIds: ["p4"] });
    expect(result.active.map((entry) => entry.id)).toEqual(["p5", "p2", "p3", "p1"]);
    expect(result.byeIds).toEqual(["p4"]);
  });

  it("returns selected active entries sorted by ranking for pairing", () => {
    const result = selectFairActiveEntries({ entries, activeCount: 4, unavailableIds: [], sortActiveByRank: true });
    expect(result.active.map((entry) => entry.id)).toEqual(["p2", "p3", "p4", "p5"]);
  });
});
