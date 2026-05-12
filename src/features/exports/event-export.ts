import type { EventRecord } from "@/features/events/event-store";
import { calculateLeaderboard } from "@/features/leaderboards/leaderboard-engine";
import { buildLeaderboardMatches, type MatchRecord } from "@/features/matches/match-model";
import type { EventPlayerRecord, PlayerRecord } from "@/features/players/player-store";
import type { TeamRecord } from "@/features/teams/team-store";
import { buildEventExportCsv, buildLeaderboardExportCsv, buildMatchesExportCsv, buildScoresExportCsv } from "./csv-export";

export type ExportKind = "leaderboard" | "matches" | "scores" | "event";

export type EventCsvExportInput = {
  kind: ExportKind;
  event: EventRecord;
  players: PlayerRecord[];
  roster: EventPlayerRecord[];
  teams: TeamRecord[];
  matches: MatchRecord[];
};

export function buildEventCsvExport(input: EventCsvExportInput): { csv: string; filename: string } {
  const participantLabels = buildParticipantLabels(input);
  const filename = `${input.event.publicSlug}-${input.kind}.csv`;

  if (input.kind === "event") return { filename, csv: buildEventExportCsv(input.event) };
  if (input.kind === "matches") return { filename, csv: buildMatchesExportCsv(input.matches, participantLabels) };
  if (input.kind === "scores") return { filename, csv: buildScoresExportCsv(input.matches, participantLabels) };

  return {
    filename,
    csv: buildLeaderboardExportCsv(calculateLeaderboard({ participants: buildParticipants(input), matches: buildLeaderboardMatches(input.matches) })),
  };
}

export function isExportKind(value: string): value is ExportKind {
  return value === "leaderboard" || value === "matches" || value === "scores" || value === "event";
}

function buildParticipants(input: EventCsvExportInput): Array<{ id: string; displayName: string }> {
  if (input.event.pairingMode === "fixed_team") return input.teams.map((team) => ({ id: team.id, displayName: team.displayName }));

  const playerById = new Map(input.players.map((player) => [player.id, player]));
  return input.roster
    .map((entry) => playerById.get(entry.playerId))
    .filter((player): player is PlayerRecord => Boolean(player))
    .map((player) => ({ id: player.id, displayName: player.displayName }));
}

function buildParticipantLabels(input: EventCsvExportInput): Map<string, string> {
  return new Map(buildParticipants(input).map((participant) => [participant.id, participant.displayName]));
}
