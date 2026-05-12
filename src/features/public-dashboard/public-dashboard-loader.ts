import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { createDrizzleTeamStore } from "@/features/teams/drizzle-team-store";
import { createDb } from "@/lib/db";
import { buildPublicDashboard, type PublicDashboardData } from "./public-dashboard";

export async function loadPublicDashboard(slug: string, query?: string | null): Promise<PublicDashboardData | null> {
  const db = createDb();
  const eventStore = createDrizzleEventStore(db);
  const playerStore = createDrizzlePlayerStore(db);
  const teamStore = createDrizzleTeamStore(db);
  const matchStore = createDrizzleMatchStore(db);

  const event = await eventStore.getEventBySlug(slug);
  if (!event) return null;

  const [players, roster, teams, matches] = await Promise.all([
    playerStore.listPlayers(),
    playerStore.listRoster(event.id),
    teamStore.listTeams(event.id),
    matchStore.listMatches(event.id),
  ]);

  return buildPublicDashboard({ event, players, roster, teams, matches, query });
}
