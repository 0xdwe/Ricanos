import { normalizePlayerName, parseMultilinePlayerList, validateRosterAdd } from "./player-model";
import type { PlayerRecord, PlayerStore } from "./player-store";

export type PlayerActionResult = { ok: true; player: PlayerRecord } | { ok: false; errors: { field: string; message: string }[] };
export type ImportPlayersResult = { ok: true; players: PlayerRecord[] } | { ok: false; errors: { field: string; message: string }[] };
export type RosterActionResult = { ok: true } | { ok: false; errors: { field: string; message: string }[] };

function displayNameFromInput(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export async function createPlayerAction(store: PlayerStore, name: string): Promise<PlayerActionResult> {
  const displayName = displayNameFromInput(name);
  const normalizedName = normalizePlayerName(displayName);
  if (!displayName) return { ok: false, errors: [{ field: "name", message: "Player name is required" }] };

  const existing = await store.findPlayerByNormalizedName(normalizedName);
  if (existing) return { ok: true, player: existing };

  const player = await store.createPlayer({ displayName, normalizedName });
  return { ok: true, player };
}

export async function importPlayersAction(store: PlayerStore, multilineNames: string): Promise<ImportPlayersResult> {
  const parsed = parseMultilinePlayerList(multilineNames);
  const players: PlayerRecord[] = [];

  for (const candidate of parsed) {
    const existing = await store.findPlayerByNormalizedName(candidate.normalizedName);
    if (existing) {
      players.push(existing);
    } else {
      players.push(await store.createPlayer(candidate));
    }
  }

  return { ok: true, players };
}

export async function addPlayerToRosterAction(store: PlayerStore, eventId: string, playerId: string): Promise<RosterActionResult> {
  const roster = await store.listRoster(eventId);
  const validation = validateRosterAdd(playerId, roster.map((entry) => entry.playerId));
  if (!validation.ok) return validation;
  await store.addPlayerToRoster(eventId, playerId);
  return { ok: true };
}
