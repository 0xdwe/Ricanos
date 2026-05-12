import { describe, expect, it } from "vitest";
import { buildEventCsvExport, type ExportKind } from "./event-export";
import type { EventRecord } from "@/features/events/event-store";
import type { MatchRecord } from "@/features/matches/match-model";
import type { PlayerRecord, EventPlayerRecord } from "@/features/players/player-store";
import type { TeamRecord } from "@/features/teams/team-store";

const now = new Date("2026-05-12T10:00:00Z");
const event: EventRecord = {
  id: "event_1",
  name: "Friday Padel",
  description: null,
  publicSlug: "friday-padel",
  status: "live",
  format: "americano",
  pairingMode: "individual",
  eventDate: null,
  venueName: null,
  venueAddress: null,
  courtCount: 1,
  roundCount: 1,
  autoRefreshSeconds: null,
  scheduleGenerated: true,
  courts: [],
  createdAt: now,
  updatedAt: now,
};
const players: PlayerRecord[] = [
  { id: "p1", displayName: "Ana", normalizedName: "ana", createdAt: now, updatedAt: now },
  { id: "p2", displayName: "Bo", normalizedName: "bo", createdAt: now, updatedAt: now },
  { id: "p3", displayName: "Cy", normalizedName: "cy", createdAt: now, updatedAt: now },
  { id: "p4", displayName: "Dee", normalizedName: "dee", createdAt: now, updatedAt: now },
];
const roster: EventPlayerRecord[] = players.map((player, index) => ({ id: `ep${index}`, eventId: "event_1", playerId: player.id, sortOrder: index + 1, createdAt: now }));
const match: MatchRecord = {
  id: "m1",
  eventId: "event_1",
  roundId: null,
  roundNumber: 1,
  courtNumber: 1,
  status: "completed",
  teamOneParticipantIds: ["p1", "p2"],
  teamTwoParticipantIds: ["p3", "p4"],
  teamOneScore: 18,
  teamTwoScore: 14,
  abandonedCountsTowardLeaderboard: false,
  updatedAt: now,
};

describe("buildEventCsvExport", () => {
  it.each<ExportKind>(["leaderboard", "matches", "scores", "event"])("builds %s csv with a stable filename", (kind) => {
    const output = buildEventCsvExport({ kind, event, players, roster, teams: [], matches: [match] });

    expect(output.filename).toBe(`friday-padel-${kind}.csv`);
    expect(output.csv.length).toBeGreaterThan(20);
  });

  it("calculates individual leaderboard exports from event roster and completed matches", () => {
    const output = buildEventCsvExport({ kind: "leaderboard", event, players, roster, teams: [], matches: [match] });

    expect(output.csv).toContain("rank,participant_id,name,played");
    expect(output.csv).toContain("1,p1,Ana,1,1,0,0,18");
  });

  it("uses fixed-team labels for team exports", () => {
    const teams: TeamRecord[] = [
      { id: "t1", eventId: "event_1", displayName: "Ana / Bo", playerIds: ["p1", "p2"], sortOrder: 1, createdAt: now, updatedAt: now },
      { id: "t2", eventId: "event_1", displayName: "Cy / Dee", playerIds: ["p3", "p4"], sortOrder: 2, createdAt: now, updatedAt: now },
    ];
    const output = buildEventCsvExport({
      kind: "matches",
      event: { ...event, pairingMode: "fixed_team" },
      players,
      roster: [],
      teams,
      matches: [{ ...match, teamOneParticipantIds: ["t1"], teamTwoParticipantIds: ["t2"] }],
    });

    expect(output.csv).toContain("Ana / Bo,Cy / Dee");
  });
});
