import { loadEventReadModelWithStandingsBySlug } from "@/features/events/event-read-model";
import { buildPublicDashboard } from "./public-dashboard";

export async function loadPublicDashboard(slug: string, query?: string | null, sortBy?: "wins" | "points") {
  const readModel = await loadEventReadModelWithStandingsBySlug(slug, sortBy ?? "wins");
  if (!readModel) return null;

  return buildPublicDashboard({ 
    event: readModel.event, 
    players: readModel.players, 
    roster: readModel.roster, 
    teams: readModel.teams, 
    matches: readModel.matches,
    standings: readModel.standings,
    query,
    sortBy: readModel.sortBy
  });
}
