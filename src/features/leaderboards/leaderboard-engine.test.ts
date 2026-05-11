import { describe, expect, it } from "vitest";
import { calculateLeaderboard } from "./leaderboard-engine";

describe("calculateLeaderboard", () => {
  it("ranks by average points, average point difference, win rate, total points, then name", () => {
    const standings = calculateLeaderboard({
      participants: [
        { id: "p1", displayName: "Alice" },
        { id: "p2", displayName: "Bob" },
        { id: "p3", displayName: "Charlie" },
      ],
      matches: [
        { status: "completed", teamOneParticipantIds: ["p1"], teamTwoParticipantIds: ["p2"], teamOneScore: 14, teamTwoScore: 10 },
        { status: "completed", teamOneParticipantIds: ["p2"], teamTwoParticipantIds: ["p3"], teamOneScore: 12, teamTwoScore: 12 },
      ],
    });

    expect(standings.map((standing) => standing.participantId)).toEqual(["p1", "p3", "p2"]);
    expect(standings[0]).toMatchObject({ participantId: "p1", played: 1, totalPoints: 14, pointDifference: 4, wins: 1, averagePoints: 14, averagePointDifference: 4, winRate: 1 });
  });

  it("ignores scheduled matches and abandoned matches that should not count", () => {
    const standings = calculateLeaderboard({
      participants: [{ id: "p1", displayName: "Alice" }, { id: "p2", displayName: "Bob" }],
      matches: [
        { status: "scheduled", teamOneParticipantIds: ["p1"], teamTwoParticipantIds: ["p2"], teamOneScore: null, teamTwoScore: null },
        { status: "abandoned", countsTowardLeaderboard: false, teamOneParticipantIds: ["p1"], teamTwoParticipantIds: ["p2"], teamOneScore: 20, teamTwoScore: 4 },
      ],
    });

    expect(standings).toEqual([
      { rank: 1, participantId: "p1", displayName: "Alice", played: 0, wins: 0, draws: 0, losses: 0, totalPoints: 0, pointsAgainst: 0, pointDifference: 0, averagePoints: 0, averagePointDifference: 0, winRate: 0 },
      { rank: 2, participantId: "p2", displayName: "Bob", played: 0, wins: 0, draws: 0, losses: 0, totalPoints: 0, pointsAgainst: 0, pointDifference: 0, averagePoints: 0, averagePointDifference: 0, winRate: 0 },
    ]);
  });

  it("supports fixed-team participants", () => {
    const standings = calculateLeaderboard({
      participants: [{ id: "t1", displayName: "Alice / Bob" }, { id: "t2", displayName: "Charlie / Dana" }],
      matches: [{ status: "completed", teamOneParticipantIds: ["t1"], teamTwoParticipantIds: ["t2"], teamOneScore: 18, teamTwoScore: 6 }],
    });

    expect(standings[0].displayName).toBe("Alice / Bob");
    expect(standings[0].averagePoints).toBe(18);
  });
});
