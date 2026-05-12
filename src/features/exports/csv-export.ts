import type { EventRecord } from "@/features/events/event-store";
import type { Standing } from "@/features/leaderboards/leaderboard-engine";
import type { MatchRecord } from "@/features/matches/match-model";

export function buildLeaderboardExportCsv(standings: Standing[]): string {
  return toCsv([
    ["rank", "participant_id", "name", "played", "wins", "draws", "losses", "total_points", "points_against", "point_difference", "average_points", "average_point_difference", "win_rate"],
    ...standings.map((standing) => [
      standing.rank,
      standing.participantId,
      standing.displayName,
      standing.played,
      standing.wins,
      standing.draws,
      standing.losses,
      standing.totalPoints,
      standing.pointsAgainst,
      standing.pointDifference,
      standing.averagePoints,
      standing.averagePointDifference,
      standing.winRate,
    ]),
  ]);
}

export function buildMatchesExportCsv(matches: MatchRecord[], participantLabels: Map<string, string>): string {
  return toCsv([
    ["match_id", "round_number", "court_number", "status", "team_one", "team_two", "team_one_score", "team_two_score", "abandoned_counts_toward_leaderboard", "updated_at"],
    ...matches.map((match) => [
      match.id,
      match.roundNumber,
      match.courtNumber,
      match.status,
      formatParticipants(match.teamOneParticipantIds, participantLabels),
      formatParticipants(match.teamTwoParticipantIds, participantLabels),
      match.teamOneScore,
      match.teamTwoScore,
      match.abandonedCountsTowardLeaderboard,
      match.updatedAt.toISOString(),
    ]),
  ]);
}

export function buildScoresExportCsv(matches: MatchRecord[], participantLabels: Map<string, string>): string {
  return toCsv([
    ["match_id", "round_number", "court_number", "team_one", "team_two", "team_one_score", "team_two_score", "total_score", "status"],
    ...matches.map((match) => [
      match.id,
      match.roundNumber,
      match.courtNumber,
      formatParticipants(match.teamOneParticipantIds, participantLabels),
      formatParticipants(match.teamTwoParticipantIds, participantLabels),
      match.teamOneScore,
      match.teamTwoScore,
      match.teamOneScore === null || match.teamTwoScore === null ? null : match.teamOneScore + match.teamTwoScore,
      match.status,
    ]),
  ]);
}

export function buildEventExportCsv(event: EventRecord): string {
  return toCsv([
    ["event_id", "name", "public_slug", "status", "format", "pairing_mode", "event_date", "venue_name", "venue_address", "court_count", "courts", "round_count", "auto_refresh_seconds", "schedule_generated", "created_at", "updated_at"],
    [
      event.id,
      event.name,
      event.publicSlug,
      event.status,
      event.format,
      event.pairingMode,
      event.eventDate,
      event.venueName,
      event.venueAddress,
      event.courtCount,
      event.courts.map((court) => court.name).join(" | "),
      event.roundCount,
      event.autoRefreshSeconds,
      event.scheduleGenerated,
      event.createdAt.toISOString(),
      event.updatedAt.toISOString(),
    ],
  ]);
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}

function toCsv(rows: Array<Array<string | number | boolean | null>>): string {
  return rows.map((row) => row.map(formatCell).join(",")).join("\n");
}

function formatCell(value: string | number | boolean | null): string {
  if (value === null) return "";
  const text = typeof value === "string" ? neutralizeSpreadsheetFormula(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function neutralizeSpreadsheetFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function formatParticipants(participantIds: string[], participantLabels: Map<string, string>): string {
  return participantIds.map((id) => participantLabels.get(id) ?? id).join(" + ");
}
