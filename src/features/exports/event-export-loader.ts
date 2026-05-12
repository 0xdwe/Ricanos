import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { createDrizzleTeamStore } from "@/features/teams/drizzle-team-store";
import { createDb } from "@/lib/db";
import { buildEventCsvExport, type ExportKind } from "./event-export";

export async function loadEventCsvExport(eventId: string, kind: ExportKind): Promise<{ csv: string; filename: string } | null> {
  const db = createDb();
  const eventStore = createDrizzleEventStore(db);
  const playerStore = createDrizzlePlayerStore(db);
  const teamStore = createDrizzleTeamStore(db);
  const matchStore = createDrizzleMatchStore(db);

  const event = await eventStore.getEvent(eventId);
  if (!event) return null;

  const [players, roster, teams, matches] = await Promise.all([
    playerStore.listPlayers(),
    playerStore.listRoster(event.id),
    teamStore.listTeams(event.id),
    matchStore.listMatches(event.id),
  ]);

  return buildEventCsvExport({ kind, event, players, roster, teams, matches });
}
