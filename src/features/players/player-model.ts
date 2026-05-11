export type PlayerName = {
  displayName: string;
  normalizedName: string;
};

export type ExistingPlayer = PlayerName & { id: string };
export type FieldError = { field: string; message: string };
export type ValidationResult = { ok: true } | { ok: false; errors: FieldError[] };

export function normalizePlayerName(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function parseMultilinePlayerList(value: string): PlayerName[] {
  const seen = new Set<string>();
  const players: PlayerName[] = [];

  for (const line of value.split(/\r?\n/)) {
    const displayName = line.trim().replace(/\s+/g, " ");
    if (!displayName) continue;
    const normalizedName = normalizePlayerName(displayName);
    if (seen.has(normalizedName)) continue;
    seen.add(normalizedName);
    players.push({ displayName, normalizedName });
  }

  return players;
}

export function findDuplicatePlayerSuggestions(candidate: PlayerName, existingPlayers: ExistingPlayer[]): ExistingPlayer[] {
  return existingPlayers.filter((player) => player.normalizedName === candidate.normalizedName);
}

export function validateRosterAdd(playerId: string, existingRosterPlayerIds: string[]): ValidationResult {
  if (existingRosterPlayerIds.includes(playerId)) {
    return { ok: false, errors: [{ field: "playerId", message: "Player is already on this event roster" }] };
  }
  return { ok: true };
}
