import { loadEventReadModelBySlug } from "@/features/events/event-read-model";
import { buildPublicDashboard } from "./public-dashboard";

export async function loadPublicDashboard(slug: string, query?: string | null) {
  const readModel = await loadEventReadModelBySlug(slug);
  if (!readModel) return null;

  return buildPublicDashboard({ 
    event: readModel.event, 
    players: readModel.players, 
    roster: readModel.roster, 
    teams: readModel.teams, 
    matches: readModel.matches, 
    query 
  });
}
