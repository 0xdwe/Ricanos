"use server";

import { revalidatePath } from "next/cache";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { createDrizzleAuditLogStore } from "@/features/audit/drizzle-audit-log-store";
import { createDrizzleTeamStore } from "@/features/teams/drizzle-team-store";
import { generateAmericanoSchedule } from "@/features/schedules/americano-scheduler";
import { generateMexicanoIndividualRound } from "@/features/schedules/mexicano-individual-scheduler";
import { generateMexicanoTeamRound } from "@/features/schedules/mexicano-team-scheduler";
import { generateTeamRoundRobinSchedule } from "@/features/schedules/team-round-robin-scheduler";
import { recordAuditEntry } from "@/features/audit/audit-log";
import { calculateLeaderboard } from "@/features/leaderboards/leaderboard-engine";
import { buildLeaderboardMatches } from "@/features/matches/match-model";
import { randomBytes } from "crypto";

const DEFAULT_MATCH_BATCH_SIZE = 6;

function countMatches(schedule: ReturnType<typeof generateAmericanoSchedule>) {
  return schedule.rounds.reduce((total, round) => total + round.matches.length, 0);
}

export async function generateScheduleFormAction(eventId: string, prevState: any, formData: FormData) {
  try {
    const store = createDrizzleEventStore();
    const event = await store.getEvent(eventId);
    if (!event) return { error: "Event not found" };

    const action = formData.get("action")?.toString();

    if (action === "preview") {
      const seed = formData.get("seed")?.toString() || randomBytes(4).toString("hex");
      const playerStore = createDrizzlePlayerStore();
      const matchStore = createDrizzleMatchStore();
      const [roster, existingMatches] = await Promise.all([playerStore.listRoster(eventId), matchStore.listMatches(eventId)]);
      
      if (roster.length < 4) {
        return { error: "Need at least 4 players to generate a schedule." };
      }

      const players = await playerStore.listPlayers();
      const playerById = new Map(players.map((p) => [p.id, p]));
      
      const schedulePlayers = roster.map(r => {
        const p = playerById.get(r.playerId);
        return p ? { id: p.id, displayName: p.displayName } : null;
      }).filter((p): p is { id: string; displayName: string } => p !== null);

      if (event.format === "americano" && event.pairingMode === "individual") {
        const matchesPerRound = Math.max(1, event.courtCount);
        const batchRounds = Math.ceil(DEFAULT_MATCH_BATCH_SIZE / matchesPerRound);
        const startRoundNumber = existingMatches.length > 0 ? Math.max(...existingMatches.map((match) => match.roundNumber)) + 1 : 1;
        const schedule = generateAmericanoSchedule({
          players: schedulePlayers,
          courtCount: event.courtCount,
          roundCount: batchRounds,
          seed: `${seed}-${startRoundNumber}`,
        });
        const normalizedSchedule = {
          ...schedule,
          seed,
          rounds: schedule.rounds.map((round, index) => ({ ...round, roundNumber: startRoundNumber + index })),
        };
        
        return { preview: normalizedSchedule, success: true, seed, matchCount: countMatches(normalizedSchedule) };
      }
      
      return { error: `Schedules for format ${event.format} with pairing ${event.pairingMode} are not implemented yet.` };
    }

    if (action === "save") {
      const rawSchedule = formData.get("scheduleData")?.toString();
      if (!rawSchedule) return { error: "No schedule data to save." };
      
      const schedule = JSON.parse(rawSchedule) as ReturnType<typeof generateAmericanoSchedule>;
      
      const matchStore = createDrizzleMatchStore();
      const auditStore = createDrizzleAuditLogStore();

      for (const round of schedule.rounds) {
        const savedRound = await matchStore.createRound({ eventId, roundNumber: round.roundNumber });
        for (const match of round.matches) {
          await matchStore.createMatch({
            eventId,
            roundId: savedRound.id,
            roundNumber: round.roundNumber,
            courtNumber: match.courtNumber,
            teamOneParticipantIds: match.teamOnePlayerIds,
            teamTwoParticipantIds: match.teamTwoPlayerIds,
            status: "scheduled"
          });
        }
      }

      await store.updateEvent(eventId, { scheduleGenerated: true });
      await store.updateStatus(eventId, "live");

      await recordAuditEntry(auditStore, {
        actionType: "schedule_generated",
        actorId: null,
        eventId,
        entityKind: "schedule",
        entityId: eventId,
        summary: `Generated ${countMatches(schedule)} more matches`,
      });

      revalidatePath(`/admin/events/${eventId}/schedule/americano`);
      revalidatePath(`/admin/events/${eventId}/scores`);
      revalidatePath(`/admin/events/${eventId}/leaderboard`);
      if (event.publicSlug) revalidatePath(`/events/${event.publicSlug}`);
      return { saved: true, success: true, matchCount: countMatches(schedule) };
    }

    return { error: "Unknown action" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to generate schedule" };
  }
}

export async function generateSingleMatchAction(eventId: string) {
  try {
    const store = createDrizzleEventStore();
    const event = await store.getEvent(eventId);
    if (!event) return { error: "Event not found" };

    const playerStore = createDrizzlePlayerStore();
    const matchStore = createDrizzleMatchStore();
    const [roster, existingMatches] = await Promise.all([playerStore.listRoster(eventId), matchStore.listMatches(eventId)]);

    const players = await playerStore.listPlayers();
    const playerById = new Map(players.map((p) => [p.id, p]));

    const schedulePlayers = roster.map(r => {
      const p = playerById.get(r.playerId);
      return p ? { id: p.id, displayName: p.displayName } : null;
    }).filter((p): p is { id: string; displayName: string } => p !== null);

    const startRoundNumber = existingMatches.length > 0 ? Math.max(...existingMatches.map((match) => match.roundNumber)) + 1 : 1;
    const auditStore = createDrizzleAuditLogStore();
    let createdCount = 0;

    if (event.pairingMode === "individual") {
      if (schedulePlayers.length < 4) return { error: "Need at least 4 players to generate a match." };
      const standings = calculateLeaderboard({ participants: schedulePlayers, matches: buildLeaderboardMatches(existingMatches) });
      const rankById = new Map(standings.map((standing, index) => [standing.participantId, index + 1]));
      const rankedPlayers = schedulePlayers.map((player, index) => ({ ...player, rank: rankById.get(player.id) ?? index + 1 }));
      const round = event.format === "mexicano"
        ? generateMexicanoIndividualRound({ players: rankedPlayers, courtCount: 1, roundNumber: startRoundNumber })
        : generateAmericanoSchedule({ players: schedulePlayers, courtCount: 1, roundCount: 1, seed: `${randomBytes(4).toString("hex")}-${startRoundNumber}` }).rounds[0];

      const savedRound = await matchStore.createRound({ eventId, roundNumber: startRoundNumber });
      for (const match of round.matches.slice(0, 1)) {
        await matchStore.createMatch({
          eventId,
          roundId: savedRound.id,
          roundNumber: startRoundNumber,
          courtNumber: 1,
          teamOneParticipantIds: match.teamOnePlayerIds,
          teamTwoParticipantIds: match.teamTwoPlayerIds,
          status: "scheduled",
        });
        createdCount += 1;
      }
    } else {
      const teamStore = createDrizzleTeamStore();
      const teams = await teamStore.listTeams(eventId);
      if (teams.length < 2) return { error: "Need at least 2 teams to generate a match." };
      const teamParticipants = teams.map((team) => ({ id: team.id, displayName: team.displayName }));
      const standings = calculateLeaderboard({ participants: teamParticipants, matches: buildLeaderboardMatches(existingMatches) });
      const rankById = new Map(standings.map((standing, index) => [standing.participantId, index + 1]));
      const rankedTeams = teamParticipants.map((team, index) => ({ ...team, rank: rankById.get(team.id) ?? index + 1 }));
      const round = event.format === "mexicano"
        ? generateMexicanoTeamRound({ teams: rankedTeams, courtCount: 1, roundNumber: startRoundNumber })
        : generateTeamRoundRobinSchedule({ teams: teamParticipants, courtCount: 1, roundCount: 1, seed: `${randomBytes(4).toString("hex")}-${startRoundNumber}` }).rounds[0];

      const savedRound = await matchStore.createRound({ eventId, roundNumber: startRoundNumber });
      for (const match of round.matches.slice(0, 1)) {
        await matchStore.createMatch({
          eventId,
          roundId: savedRound.id,
          roundNumber: startRoundNumber,
          courtNumber: 1,
          teamOneParticipantIds: [match.teamOneId],
          teamTwoParticipantIds: [match.teamTwoId],
          status: "scheduled",
        });
        createdCount += 1;
      }
    }

    await store.updateEvent(eventId, { scheduleGenerated: true });
    if (event.status === "draft" || event.status === "ready") {
      await store.updateStatus(eventId, "live");
    }

    await recordAuditEntry(auditStore, {
      actionType: "schedule_generated",
      actorId: null,
      eventId,
      entityKind: "schedule",
      entityId: eventId,
      summary: `Generated ${createdCount} new match${createdCount === 1 ? "" : "es"}`,
    });

    revalidatePath(`/admin/events/${eventId}/scores`);
    revalidatePath(`/admin/events/${eventId}/leaderboard`);
    if (event.publicSlug) revalidatePath(`/events/${event.publicSlug}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to generate match" };
  }
}
