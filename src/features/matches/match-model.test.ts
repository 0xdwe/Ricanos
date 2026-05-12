import { describe, expect, it } from "vitest";
import { buildLeaderboardMatches, recordScore, transitionMatchStatus, type MatchRecord } from "./match-model";

const baseMatch: MatchRecord = {
  id: "match_1",
  eventId: "event_1",
  roundId: "round_1",
  roundNumber: 1,
  courtNumber: 1,
  status: "scheduled",
  teamOneParticipantIds: ["p1", "p4"],
  teamTwoParticipantIds: ["p2", "p3"],
  teamOneScore: null,
  teamTwoScore: null,
  abandonedCountsTowardLeaderboard: false,
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("match score domain", () => {
  it("records any non-negative whole-number scores and completes the match", () => {
    const result = recordScore(baseMatch, { teamOneScore: 14, teamTwoScore: 9 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.match).toMatchObject({ status: "completed", teamOneScore: 14, teamTwoScore: 9 });
    }
  });

  it("rejects negative and decimal scores", () => {
    expect(recordScore(baseMatch, { teamOneScore: -1, teamTwoScore: 25 })).toEqual({
      ok: false,
      errors: [{ field: "teamOneScore", message: "Team one score must be a non-negative whole number" }],
    });
    expect(recordScore(baseMatch, { teamOneScore: 12.5, teamTwoScore: 11.5 })).toEqual({
      ok: false,
      errors: [{ field: "teamOneScore", message: "Team one score must be a non-negative whole number" }],
    });
  });

  it("supports status transitions and abandoned count/no-count behavior", () => {
    expect(transitionMatchStatus(baseMatch, "in_progress").ok).toBe(true);
    expect(transitionMatchStatus(baseMatch, "completed")).toEqual({ ok: false, errors: [{ field: "status", message: "Completed matches require both scores" }] });

    const abandoned = transitionMatchStatus({ ...baseMatch, teamOneScore: 6, teamTwoScore: 4 }, "abandoned", { abandonedCountsTowardLeaderboard: true });
    expect(abandoned.ok).toBe(true);
    if (abandoned.ok) {
      expect(abandoned.match).toMatchObject({ status: "abandoned", abandonedCountsTowardLeaderboard: true });
      expect(buildLeaderboardMatches([abandoned.match])).toEqual([
        {
          status: "abandoned",
          countsTowardLeaderboard: true,
          teamOneParticipantIds: ["p1", "p4"],
          teamTwoParticipantIds: ["p2", "p3"],
          teamOneScore: 6,
          teamTwoScore: 4,
        },
      ]);
    }
  });

  it("maps completed and abandoned-not-counted matches for leaderboard engine", () => {
    expect(buildLeaderboardMatches([{ ...baseMatch, status: "completed", teamOneScore: 14, teamTwoScore: 10 }])).toEqual([
      {
        status: "completed",
        countsTowardLeaderboard: undefined,
        teamOneParticipantIds: ["p1", "p4"],
        teamTwoParticipantIds: ["p2", "p3"],
        teamOneScore: 14,
        teamTwoScore: 10,
      },
    ]);

    expect(buildLeaderboardMatches([{ ...baseMatch, status: "abandoned", teamOneScore: 6, teamTwoScore: 4, abandonedCountsTowardLeaderboard: false }])[0].countsTowardLeaderboard).toBe(false);
  });
});
