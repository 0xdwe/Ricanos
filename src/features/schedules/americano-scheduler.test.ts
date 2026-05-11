import { describe, expect, it } from "vitest";
import { generateAmericanoSchedule } from "./americano-scheduler";

describe("generateAmericanoSchedule", () => {
  const players = Array.from({ length: 8 }, (_, index) => ({ id: `p${index + 1}`, displayName: `Player ${index + 1}` }));

  it("generates deterministic rounds for a seed", () => {
    const first = generateAmericanoSchedule({ players, courtCount: 2, roundCount: 3, seed: "abc" });
    const second = generateAmericanoSchedule({ players, courtCount: 2, roundCount: 3, seed: "abc" });
    expect(first).toEqual(second);
  });

  it("fills each court with four unique active players", () => {
    const schedule = generateAmericanoSchedule({ players, courtCount: 2, roundCount: 2, seed: "abc" });
    expect(schedule.rounds).toHaveLength(2);
    for (const round of schedule.rounds) {
      expect(round.matches).toHaveLength(2);
      const roundPlayerIds = round.matches.flatMap((match) => [...match.teamOnePlayerIds, ...match.teamTwoPlayerIds]);
      expect(new Set(roundPlayerIds).size).toBe(roundPlayerIds.length);
    }
  });

  it("tracks repeated partners as warnings when rounds exceed perfect rotation", () => {
    const schedule = generateAmericanoSchedule({ players: players.slice(0, 4), courtCount: 1, roundCount: 3, seed: "abc" });
    expect(schedule.warnings.length).toBeGreaterThan(0);
  });
});
