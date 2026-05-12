import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { createDrizzleTeamStore } from "@/features/teams/drizzle-team-store";
import { createDb } from "@/lib/db";
import type { EventRecord } from "./event-store";
import type { PlayerRecord } from "@/features/players/player-store";
import type { EventPlayerRecord } from "@/features/players/player-store";
import type { TeamRecord } from "@/features/teams/team-store";
import type { MatchRecord } from "@/features/matches/match-model";

export type Participant = {
  id: string;
  displayName: string;
};

export type EventReadModel = {
  event: EventRecord;
  players: PlayerRecord[];
  roster: EventPlayerRecord[];
  teams: TeamRecord[];
  matches: MatchRecord[];
  participants: Participant[];
  playerById: Map<string, PlayerRecord>;
  nameById: Map<string, string>;
};

/**
 * Load complete event read model for admin pages.
 * Includes event, players, roster, teams, matches, and derived participant list.
 */
export async function loadEventReadModel(eventId: string): Promise<EventReadModel | null> {
  const db = createDb();
  const eventStore = createDrizzleEventStore(db);
  const playerStore = createDrizzlePlayerStore(db);
  const teamStore = createDrizzleTeamStore(db);
  const matchStore = createDrizzleMatchStore(db);

  const event = await eventStore.getEvent(eventId);
  if (!event) return null;

  const [players, roster, teams, matches] = await Promise.all([
    playerStore.listPlayers(),
    playerStore.listRoster(eventId),
    teamStore.listTeams(eventId),
    matchStore.listMatches(eventId),
  ]);

  const playerById = new Map(players.map((p) => [p.id, p]));
  
  // Build nameById map for both players and teams
  const nameById = new Map<string, string>();
  players.forEach((p) => nameById.set(p.id, p.displayName));
  teams.forEach((t) => nameById.set(t.id, t.displayName));

  const participants: Participant[] =
    event.pairingMode === "fixed_team"
      ? teams.map((t) => ({ id: t.id, displayName: t.displayName }))
      : roster
          .map((r) => {
            const p = playerById.get(r.playerId);
            return p ? { id: p.id, displayName: p.displayName } : null;
          })
          .filter((p): p is Participant => p !== null);

  return {
    event,
    players,
    roster,
    teams,
    matches,
    participants,
    playerById,
    nameById,
  };
}

/**
 * Load event read model by public slug for public pages.
 */
export async function loadEventReadModelBySlug(slug: string): Promise<EventReadModel | null> {
  const db = createDb();
  const eventStore = createDrizzleEventStore(db);

  const event = await eventStore.getEventBySlug(slug);
  if (!event) return null;

  return loadEventReadModel(event.id);
}
