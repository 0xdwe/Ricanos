import { createTeamDisplayName, parseFixedTeamLines, validateFixedTeamPlayers } from "./team-model";
import type { TeamRecord, TeamStore, TeamStorePlayer } from "./team-store";

export type TeamActionResult = { ok: true; team: TeamRecord } | { ok: false; errors: { field: string; message: string }[] };
export type ImportTeamsResult = { ok: true; teams: TeamRecord[]; createdPlayers: TeamStorePlayer[] } | { ok: false; errors: { field: string; message: string }[] };

export async function createFixedTeamAction(
  store: TeamStore,
  eventId: string,
  playerOneId: string,
  playerOneName: string,
  playerTwoId: string,
  playerTwoName: string,
): Promise<TeamActionResult> {
  const validation = validateFixedTeamPlayers(playerOneId, playerTwoId);
  if (!validation.ok) return validation;
  const team = await store.createTeam({ eventId, displayName: createTeamDisplayName(playerOneName, playerTwoName), playerIds: [playerOneId, playerTwoId] });
  return { ok: true, team };
}

export async function importFixedTeamsAction(store: TeamStore, eventId: string, pastedTeams: string): Promise<ImportTeamsResult> {
  const parsed = parseFixedTeamLines(pastedTeams);
  if (!parsed.ok) return { ok: false, errors: parsed.errors.map((error) => ({ field: `line.${error.line}`, message: error.message })) };

  const teams: TeamRecord[] = [];
  const createdPlayers: TeamStorePlayer[] = [];
  for (const parsedTeam of parsed.teams) {
    const playerOne = await store.createOrFindPlayer(parsedTeam.playerOneName);
    const playerTwo = await store.createOrFindPlayer(parsedTeam.playerTwoName);
    createdPlayers.push(playerOne, playerTwo);
    const result = await createFixedTeamAction(store, eventId, playerOne.id, playerOne.displayName, playerTwo.id, playerTwo.displayName);
    if (!result.ok) return result;
    teams.push(result.team);
  }
  return { ok: true, teams, createdPlayers };
}
