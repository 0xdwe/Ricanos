import { buildLeaderboardMatches, type MatchRecord } from "@/features/matches/match-model";
import { calculateLeaderboard, type Standing } from "@/features/leaderboards/leaderboard-engine";
import type { EventRecord } from "@/features/events/event-store";
import type { EventPlayerRecord, PlayerRecord } from "@/features/players/player-store";
import type { TeamRecord } from "@/features/teams/team-store";

export type PublicMatchCard = {
  id: string;
  roundNumber: number;
  courtNumber: number;
  status: MatchRecord["status"];
  teamOneLabel: string;
  teamTwoLabel: string;
  teamOneScore: number | null;
  teamTwoScore: number | null;
  highlighted: boolean;
};

export type PublicDashboardData = {
  event: Pick<EventRecord, "name" | "description" | "publicSlug" | "status" | "format" | "pairingMode" | "eventDate" | "venueName" | "venueAddress" | "autoRefreshSeconds">;
  standings: Array<Standing & { highlighted: boolean }>;
  playerOptions: string[];
  currentAndUpcomingMatches: PublicMatchCard[];
  matchHistory: PublicMatchCard[];
  query: string;
  lastUpdatedAt: Date | null;
};

export function buildPublicDashboard(input: {
  event: EventRecord;
  players: PlayerRecord[];
  roster: EventPlayerRecord[];
  teams: TeamRecord[];
  matches: MatchRecord[];
  query?: string | null;
}): PublicDashboardData {
  const query = (input.query ?? "").trim();
  const normalizedQuery = query.toLocaleLowerCase();
  const playerById = new Map(input.players.map((player) => [player.id, player]));

  const participants = input.event.pairingMode === "fixed_team"
    ? input.teams.map((team) => ({ id: team.id, displayName: team.displayName }))
    : input.roster
        .map((entry) => playerById.get(entry.playerId))
        .filter((player): player is PlayerRecord => Boolean(player))
        .map((player) => ({ id: player.id, displayName: player.displayName }));

  const participantLabels = new Map(participants.map((participant) => [participant.id, participant.displayName]));
  const standings = calculateLeaderboard({ participants, matches: buildLeaderboardMatches(input.matches) }).map((standing) => ({
    ...standing,
    highlighted: matchesQuery(standing.displayName, normalizedQuery),
  }));

  const cards = input.matches
    .slice()
    .sort((a, b) => a.roundNumber - b.roundNumber || a.courtNumber - b.courtNumber)
    .map((match) => toMatchCard(match, participantLabels, normalizedQuery));

  const lastUpdatedAt = input.matches.length === 0 ? null : input.matches.reduce((latest, match) => (match.updatedAt > latest ? match.updatedAt : latest), input.matches[0].updatedAt);

  return {
    event: {
      name: input.event.name,
      description: input.event.description,
      publicSlug: input.event.publicSlug,
      status: input.event.status,
      format: input.event.format,
      pairingMode: input.event.pairingMode,
      eventDate: input.event.eventDate,
      venueName: input.event.venueName,
      venueAddress: input.event.venueAddress,
      autoRefreshSeconds: input.event.autoRefreshSeconds,
    },
    standings,
    playerOptions: participants.map((participant) => participant.displayName).sort((a, b) => a.localeCompare(b)),
    currentAndUpcomingMatches: cards.filter((match) => match.status === "scheduled" || match.status === "in_progress"),
    matchHistory: cards.filter((match) => match.status === "completed" || match.status === "abandoned").reverse(),
    query,
    lastUpdatedAt,
  };
}

function toMatchCard(match: MatchRecord, participantLabels: Map<string, string>, normalizedQuery: string): PublicMatchCard {
  const teamOneLabel = formatTeamLabel(match.teamOneParticipantIds, participantLabels);
  const teamTwoLabel = formatTeamLabel(match.teamTwoParticipantIds, participantLabels);
  return {
    id: match.id,
    roundNumber: match.roundNumber,
    courtNumber: match.courtNumber,
    status: match.status,
    teamOneLabel,
    teamTwoLabel,
    teamOneScore: match.teamOneScore,
    teamTwoScore: match.teamTwoScore,
    highlighted: matchesQuery(`${teamOneLabel} ${teamTwoLabel}`, normalizedQuery),
  };
}

function formatTeamLabel(participantIds: string[], participantLabels: Map<string, string>): string {
  return participantIds.map((id) => participantLabels.get(id) ?? "Unknown participant").join(" + ");
}

function matchesQuery(value: string, normalizedQuery: string): boolean {
  return normalizedQuery.length > 0 && value.toLocaleLowerCase().includes(normalizedQuery);
}
