import { describe, expect, it } from "vitest";
import { calculateLeaderboard } from "./leaderboard-engine";

describe("calculateLeaderboard", () => {
  it("ranks by wins first, then total points, point difference, win rate, and name", () => {
    const standings = calculateLeaderboard({
      participants: [
        { id: "p1", displayName: "Alice" },
        { id: "p2", displayName: "Bob" },
        { id: "p3", displayName: "Charlie" },
      ],
      matches: [
        { status: "completed", teamOneParticipantIds: ["p1"], teamTwoParticipantIds: ["p2"], teamOneScore: 11, teamTwoScore: 10 },
        { status: "completed", teamOneParticipantIds: ["p2"], teamTwoParticipantIds: ["p3"], teamOneScore: 30, teamTwoScore: 29 },
        { status: "completed", teamOneParticipantIds: ["p1"], teamTwoParticipantIds: ["p3"], teamOneScore: 12, teamTwoScore: 8 },
      ],
    });

    expect(standings.map((standing) => standing.participantId)).toEqual(["p1", "p2", "p3"]);
    expect(standings[0]).toMatchObject({ participantId: "p1", played: 2, totalPoints: 23, pointDifference: 5, wins: 2, losses: 0, averagePoints: 11.5, averagePointDifference: 2.5, winRate: 1 });
  });

  it("uses points as the next priority when wins are tied", () => {
    const standings = calculateLeaderboard({
      participants: [
        { id: "p1", displayName: "Alice" },
        { id: "p2", displayName: "Bob" },
      ],
      matches: [
        { status: "completed", teamOneParticipantIds: ["p1"], teamTwoParticipantIds: ["x1"], teamOneScore: 15, teamTwoScore: 10 },
        { status: "completed", teamOneParticipantIds: ["p2"], teamTwoParticipantIds: ["x2"], teamOneScore: 20, teamTwoScore: 18 },
      ],
    });

    expect(standings.map((standing) => standing.participantId)).toEqual(["p2", "p1"]);
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
