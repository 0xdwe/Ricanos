import { describe, expect, it } from "vitest";
import { generateTeamRoundRobinSchedule } from "./team-round-robin-scheduler";

describe("generateTeamRoundRobinSchedule", () => {
  const teams = Array.from({ length: 5 }, (_, index) => ({ id: `t${index + 1}`, displayName: `Team ${index + 1}` }));

  it("generates deterministic team round-robin previews", () => {
    const a = generateTeamRoundRobinSchedule({ teams, courtCount: 2, roundCount: 3, seed: "seed" });
    const b = generateTeamRoundRobinSchedule({ teams, courtCount: 2, roundCount: 3, seed: "seed" });
    expect(a).toEqual(b);
  });

  it("creates matches with two different teams", () => {
    const schedule = generateTeamRoundRobinSchedule({ teams: teams.slice(0, 4), courtCount: 2, roundCount: 2, seed: "seed" });
    for (const round of schedule.rounds) {
      for (const match of round.matches) {
        expect(match.teamOneId).not.toBe(match.teamTwoId);
      }
    }
  });

  it("tracks byes for odd team counts", () => {
    const schedule = generateTeamRoundRobinSchedule({ teams, courtCount: 2, roundCount: 1, seed: "seed" });
    expect(schedule.rounds[0].byeTeamIds).toHaveLength(1);
  });
});
