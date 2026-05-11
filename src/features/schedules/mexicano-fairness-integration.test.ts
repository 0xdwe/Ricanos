import { describe, expect, it } from "vitest";
import { generateMexicanoIndividualRound } from "./mexicano-individual-scheduler";
import { generateMexicanoTeamRound } from "./mexicano-team-scheduler";

describe("Mexicano fairness integration", () => {
  it("selects individual active players by fairness before rank pairing", () => {
    const players = [
      { id: "p1", displayName: "A", rank: 1, matchesPlayed: 4, roundsSinceBye: 1 },
      { id: "p2", displayName: "B", rank: 2, matchesPlayed: 1, roundsSinceBye: 0 },
      { id: "p3", displayName: "C", rank: 3, matchesPlayed: 1, roundsSinceBye: 2 },
      { id: "p4", displayName: "D", rank: 4, matchesPlayed: 1, roundsSinceBye: 1 },
      { id: "p5", displayName: "E", rank: 5, matchesPlayed: 1, roundsSinceBye: 3 },
    ];

    const round = generateMexicanoIndividualRound({ players, courtCount: 1, roundNumber: 2, unavailablePlayerIds: [] });
    expect(round.byePlayerIds).toEqual(["p1"]);
    expect(round.matches[0]).toMatchObject({ teamOnePlayerIds: ["p2", "p5"], teamTwoPlayerIds: ["p3", "p4"] });
  });

  it("selects fixed-team active teams by fairness before rank pairing", () => {
    const teams = [
      { id: "t1", displayName: "A", rank: 1, matchesPlayed: 3, roundsSinceBye: 1 },
      { id: "t2", displayName: "B", rank: 2, matchesPlayed: 1, roundsSinceBye: 0 },
      { id: "t3", displayName: "C", rank: 3, matchesPlayed: 1, roundsSinceBye: 2 },
    ];

    const round = generateMexicanoTeamRound({ teams, courtCount: 1, roundNumber: 2, unavailableTeamIds: [] });
    expect(round.byeTeamIds).toEqual(["t1"]);
    expect(round.matches[0]).toMatchObject({ teamOneId: "t2", teamTwoId: "t3" });
  });
});
