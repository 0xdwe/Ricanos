export type ParsedFixedTeam = {
  playerOneName: string;
  playerTwoName: string;
  displayName: string;
};

export type TeamParseResult = { ok: true; teams: ParsedFixedTeam[] } | { ok: false; errors: { line: number; message: string }[] };
export type TeamValidationResult = { ok: true } | { ok: false; errors: { field: string; message: string }[] };

function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function createTeamDisplayName(playerOneName: string, playerTwoName: string): string {
  return `${cleanName(playerOneName)} / ${cleanName(playerTwoName)}`;
}

export function parseFixedTeamLines(value: string): TeamParseResult {
  const teams: ParsedFixedTeam[] = [];
  const errors: { line: number; message: string }[] = [];

  value.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    const parts = line.split("/").map(cleanName).filter(Boolean);
    if (parts.length !== 2) {
      errors.push({ line: index + 1, message: "Team line must contain exactly two player names separated by /" });
      return;
    }
    teams.push({ playerOneName: parts[0], playerTwoName: parts[1], displayName: createTeamDisplayName(parts[0], parts[1]) });
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, teams };
}

export function validateFixedTeamPlayers(playerOneId: string, playerTwoId: string): TeamValidationResult {
  if (playerOneId === playerTwoId) {
    return { ok: false, errors: [{ field: "playerTwoId", message: "A fixed team must contain two different players" }] };
  }
  return { ok: true };
}
