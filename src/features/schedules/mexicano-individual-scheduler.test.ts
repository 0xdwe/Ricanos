import { describe, expect, it } from "vitest";
import { generateMexicanoIndividualRound } from "./mexicano-individual-scheduler";

describe("generateMexicanoIndividualRound", () => {
  const players = Array.from({ length: 8 }, (_, index) => ({ id: `p${index + 1}`, displayName: `Player ${index + 1}`, rank: index + 1 }));

  it("groups ranked players by court and balances teams #1+#4 vs #2+#3", () => {
    const round = generateMexicanoIndividualRound({ players, courtCount: 2, roundNumber: 2 });
    expect(round.matches[0]).toMatchObject({ courtNumber: 1, teamOnePlayerIds: ["p1", "p4"], teamTwoPlayerIds: ["p2", "p3"] });
    expect(round.matches[1]).toMatchObject({ courtNumber: 2, teamOnePlayerIds: ["p5", "p8"], teamTwoPlayerIds: ["p6", "p7"] });
  });

  it("limits active players to court capacity", () => {
    const round = generateMexicanoIndividualRound({ players, courtCount: 1, roundNumber: 1 });
    expect(round.matches).toHaveLength(1);
    expect(round.byePlayerIds).toEqual(["p5", "p6", "p7", "p8"]);
  });
});
