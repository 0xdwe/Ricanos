import { describe, expect, it } from "vitest";
import { generateMexicanoTeamRound } from "./mexicano-team-scheduler";

describe("generateMexicanoTeamRound", () => {
  const teams = Array.from({ length: 5 }, (_, index) => ({ id: `t${index + 1}`, displayName: `Team ${index + 1}`, rank: index + 1 }));

  it("pairs fixed teams by power rank", () => {
    const round = generateMexicanoTeamRound({ teams, courtCount: 2, roundNumber: 3 });
    expect(round.matches).toEqual([
      { courtNumber: 1, teamOneId: "t1", teamTwoId: "t2", manualOverride: false },
      { courtNumber: 2, teamOneId: "t3", teamTwoId: "t4", manualOverride: false },
    ]);
  });

  it("benches teams beyond court capacity", () => {
    const round = generateMexicanoTeamRound({ teams, courtCount: 1, roundNumber: 1 });
    expect(round.byeTeamIds).toEqual(["t3", "t4", "t5"]);
  });
});
