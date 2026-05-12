export type LeaderboardParticipant = { id: string; displayName: string };
export type LeaderboardMatch = {
  status: "scheduled" | "in_progress" | "completed" | "abandoned";
  countsTowardLeaderboard?: boolean;
  teamOneParticipantIds: string[];
  teamTwoParticipantIds: string[];
  teamOneScore: number | null;
  teamTwoScore: number | null;
};

export type Standing = {
  rank: number;
  participantId: string;
  displayName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  totalPoints: number;
  pointsAgainst: number;
  pointDifference: number;
  averagePoints: number;
  averagePointDifference: number;
  winRate: number;
};

function roundMetric(value: number): number {
  return Number(value.toFixed(3));
}

function shouldCount(match: LeaderboardMatch): boolean {
  if (match.status === "completed") return match.teamOneScore !== null && match.teamTwoScore !== null;
  if (match.status === "abandoned") return match.countsTowardLeaderboard === true && match.teamOneScore !== null && match.teamTwoScore !== null;
  return false;
}

export function calculateLeaderboard({ participants, matches, sortBy = "wins" }: { participants: LeaderboardParticipant[]; matches: LeaderboardMatch[], sortBy?: "wins" | "points" }): Standing[] {
  const standings = new Map<string, Standing>();

  for (const participant of participants) {
    standings.set(participant.id, {
      rank: 0,
      participantId: participant.id,
      displayName: participant.displayName,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      totalPoints: 0,
      pointsAgainst: 0,
      pointDifference: 0,
      averagePoints: 0,
      averagePointDifference: 0,
      winRate: 0,
    });
  }

  for (const match of matches) {
    if (!shouldCount(match)) continue;
    const teamOneScore = match.teamOneScore ?? 0;
    const teamTwoScore = match.teamTwoScore ?? 0;
    const teamOneResult = teamOneScore > teamTwoScore ? "win" : teamOneScore === teamTwoScore ? "draw" : "loss";
    const teamTwoResult = teamTwoScore > teamOneScore ? "win" : teamTwoScore === teamOneScore ? "draw" : "loss";

    for (const participantId of match.teamOneParticipantIds) {
      applyResult(standings.get(participantId), teamOneScore, teamTwoScore, teamOneResult);
    }
    for (const participantId of match.teamTwoParticipantIds) {
      applyResult(standings.get(participantId), teamTwoScore, teamOneScore, teamTwoResult);
    }
  }

  return [...standings.values()]
    .map((standing) => ({
      ...standing,
      pointDifference: standing.totalPoints - standing.pointsAgainst,
      averagePoints: standing.played === 0 ? 0 : roundMetric(standing.totalPoints / standing.played),
      averagePointDifference: standing.played === 0 ? 0 : roundMetric((standing.totalPoints - standing.pointsAgainst) / standing.played),
      winRate: standing.played === 0 ? 0 : roundMetric(standing.wins / standing.played),
    }))
    .sort((a, b) => {
      if (sortBy === "points") {
        return (
          b.totalPoints - a.totalPoints ||
          b.pointDifference - a.pointDifference ||
          b.wins - a.wins ||
          b.winRate - a.winRate ||
          a.losses - b.losses ||
          a.displayName.localeCompare(b.displayName)
        );
      } else {
        return (
          b.wins - a.wins ||
          b.totalPoints - a.totalPoints ||
          b.pointDifference - a.pointDifference ||
          b.winRate - a.winRate ||
          a.losses - b.losses ||
          a.displayName.localeCompare(b.displayName)
        );
      }
    })
    .map((standing, index) => ({ ...standing, rank: index + 1 }));
}

function applyResult(standing: Standing | undefined, pointsFor: number, pointsAgainst: number, result: "win" | "draw" | "loss") {
  if (!standing) return;
  standing.played += 1;
  standing.totalPoints += pointsFor;
  standing.pointsAgainst += pointsAgainst;
  if (result === "win") standing.wins += 1;
  if (result === "draw") standing.draws += 1;
  if (result === "loss") standing.losses += 1;
}
