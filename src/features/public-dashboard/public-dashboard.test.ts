import { describe, expect, it } from "vitest";
import { buildPublicDashboard } from "./public-dashboard";
import type { EventRecord } from "@/features/events/event-store";
import type { MatchRecord } from "@/features/matches/match-model";

const now = new Date("2026-05-12T10:00:00Z");
const event: EventRecord = {
  id: "event_1",
  name: "Friday Padel",
  description: "Community night",
  publicSlug: "friday-padel",
  status: "live",
  format: "mexicano",
  pairingMode: "individual",
  eventDate: "2026-05-12",
  venueName: "Ricanos Club",
  venueAddress: "Court Street",
  courtCount: 1,
  roundCount: 2,
  autoRefreshSeconds: 15,
  scheduleGenerated: true,
  courts: [],
  createdAt: now,
  updatedAt: now,
};

function match(input: Partial<MatchRecord> & Pick<MatchRecord, "id" | "roundNumber" | "status" | "teamOneParticipantIds" | "teamTwoParticipantIds" | "teamOneScore" | "teamTwoScore">): MatchRecord {
  return {
    eventId: "event_1",
    roundId: null,
    courtNumber: 1,
    abandonedCountsTowardLeaderboard: false,
    updatedAt: now,
    ...input,
  };
}

describe("buildPublicDashboard", () => {
  it("builds leaderboard-first public data with search highlights and match sections", () => {
    const dashboard = buildPublicDashboard({
      event,
      query: "ana",
      players: [
        { id: "p1", displayName: "Ana", normalizedName: "ana", createdAt: now, updatedAt: now },
        { id: "p2", displayName: "Bo", normalizedName: "bo", createdAt: now, updatedAt: now },
        { id: "p3", displayName: "Cy", normalizedName: "cy", createdAt: now, updatedAt: now },
        { id: "p4", displayName: "Dee", normalizedName: "dee", createdAt: now, updatedAt: now },
      ],
      roster: ["p1", "p2", "p3", "p4"].map((playerId, index) => ({ id: `ep${index}`, eventId: "event_1", playerId, sortOrder: index + 1, createdAt: now })),
      teams: [],
      matches: [
        match({ id: "m1", roundNumber: 1, status: "completed", teamOneParticipantIds: ["p1", "p2"], teamTwoParticipantIds: ["p3", "p4"], teamOneScore: 20, teamTwoScore: 12 }),
        match({ id: "m2", roundNumber: 2, status: "scheduled", teamOneParticipantIds: ["p1", "p4"], teamTwoParticipantIds: ["p2", "p3"], teamOneScore: null, teamTwoScore: null }),
      ],
    });

    expect(dashboard.event.name).toBe("Friday Padel");
    expect(dashboard.playerOptions).toEqual(["Ana", "Bo", "Cy", "Dee"]);
    expect(dashboard.standings[0]).toMatchObject({ displayName: "Ana", played: 1, totalPoints: 20, highlighted: true });
    expect(dashboard.currentAndUpcomingMatches).toHaveLength(1);
    expect(dashboard.currentAndUpcomingMatches[0]).toMatchObject({ teamOneLabel: "Ana + Dee", highlighted: true });
    expect(dashboard.matchHistory).toHaveLength(1);
    expect(dashboard.matchHistory[0]).toMatchObject({ teamOneLabel: "Ana + Bo", teamTwoScore: 12 });
  });

  it("uses fixed teams as leaderboard participants", () => {
    const dashboard = buildPublicDashboard({
      event: { ...event, pairingMode: "fixed_team" },
      players: [],
      roster: [],
      teams: [
        { id: "t1", eventId: "event_1", displayName: "Ana / Bo", playerIds: ["p1", "p2"], sortOrder: 1, createdAt: now, updatedAt: now },
        { id: "t2", eventId: "event_1", displayName: "Cy / Dee", playerIds: ["p3", "p4"], sortOrder: 2, createdAt: now, updatedAt: now },
      ],
      matches: [match({ id: "m1", roundNumber: 1, status: "completed", teamOneParticipantIds: ["t1"], teamTwoParticipantIds: ["t2"], teamOneScore: 18, teamTwoScore: 14 })],
    });

    expect(dashboard.standings.map((standing) => standing.displayName)).toEqual(["Ana / Bo", "Cy / Dee"]);
    expect(dashboard.matchHistory[0].teamOneLabel).toBe("Ana / Bo");
  });
});
