import { describe, expect, it } from "vitest";
import { buildEventExportCsv, buildLeaderboardExportCsv, buildMatchesExportCsv, buildScoresExportCsv } from "./csv-export";
import type { EventRecord } from "@/features/events/event-store";
import type { MatchRecord } from "@/features/matches/match-model";
import type { Standing } from "@/features/leaderboards/leaderboard-engine";

const now = new Date("2026-05-12T10:00:00Z");
const event: EventRecord = {
  id: "event_1",
  name: "Friday, Padel",
  description: "Community night",
  publicSlug: "friday-padel",
  status: "live",
  format: "americano",
  pairingMode: "individual",
  eventDate: "2026-05-12",
  venueName: "Ricanos Club",
  venueAddress: "Court Street",
  courtCount: 2,
  scoreTarget: 32,
  roundCount: 3,
  autoRefreshSeconds: 15,
  scheduleGenerated: true,
  courts: [
    { id: "c1", eventId: "event_1", name: "Indoor 1", sortOrder: 1 },
    { id: "c2", eventId: "event_1", name: "Outdoor A", sortOrder: 2 },
  ],
  createdAt: now,
  updatedAt: now,
};

const standing: Standing = {
  rank: 1,
  participantId: "p1",
  displayName: "Ana, Captain",
  played: 2,
  wins: 1,
  draws: 0,
  losses: 1,
  totalPoints: 33,
  pointsAgainst: 31,
  pointDifference: 2,
  averagePoints: 16.5,
  averagePointDifference: 1,
  winRate: 0.5,
};

const match: MatchRecord = {
  id: "m1",
  eventId: "event_1",
  roundId: "r1",
  roundNumber: 1,
  courtNumber: 2,
  status: "completed",
  teamOneParticipantIds: ["p1", "p2"],
  teamTwoParticipantIds: ["p3", "p4"],
  teamOneScore: 18,
  teamTwoScore: 14,
  scoreTarget: 32,
  scoreOverrideWarning: null,
  abandonedCountsTowardLeaderboard: false,
  updatedAt: now,
};

describe("CSV exports", () => {
  it("exports leaderboard rows with stable headers and escaped values", () => {
    expect(buildLeaderboardExportCsv([standing])).toBe([
      "rank,participant_id,name,played,wins,draws,losses,total_points,points_against,point_difference,average_points,average_point_difference,win_rate",
      '1,p1,"Ana, Captain",2,1,0,1,33,31,2,16.5,1,0.5',
    ].join("\n"));
  });

  it("neutralizes spreadsheet formulas in user-controlled text cells", () => {
    expect(buildLeaderboardExportCsv([{ ...standing, displayName: "=IMPORTXML(1)" }])).toContain("'=IMPORTXML(1)");
  });

  it("exports matches with readable participant labels", () => {
    expect(buildMatchesExportCsv([match], new Map([["p1", "Ana"], ["p2", "Bo"], ["p3", "Cy"], ["p4", "Dee"]]))).toBe([
      "match_id,round_number,court_number,status,team_one,team_two,team_one_score,team_two_score,score_target,score_override_warning,abandoned_counts_toward_leaderboard,updated_at",
      'm1,1,2,completed,Ana + Bo,Cy + Dee,18,14,32,,false,2026-05-12T10:00:00.000Z',
    ].join("\n"));
  });

  it("exports score-only rows for quick score analysis", () => {
    expect(buildScoresExportCsv([match], new Map([["p1", "Ana"], ["p2", "Bo"], ["p3", "Cy"], ["p4", "Dee"]]))).toBe([
      "match_id,round_number,court_number,team_one,team_two,team_one_score,team_two_score,total_score,status",
      "m1,1,2,Ana + Bo,Cy + Dee,18,14,32,completed",
    ].join("\n"));
  });

  it("exports event metadata including court names", () => {
    expect(buildEventExportCsv(event)).toBe([
      "event_id,name,public_slug,status,format,pairing_mode,event_date,venue_name,venue_address,court_count,courts,score_target,round_count,auto_refresh_seconds,schedule_generated,created_at,updated_at",
      'event_1,"Friday, Padel",friday-padel,live,americano,individual,2026-05-12,Ricanos Club,Court Street,2,Indoor 1 | Outdoor A,32,3,15,true,2026-05-12T10:00:00.000Z,2026-05-12T10:00:00.000Z',
    ].join("\n"));
  });
});
