"use server";

import { revalidatePath } from "next/cache";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { createDrizzleAuditLogStore } from "@/features/audit/drizzle-audit-log-store";
import { generateAmericanoSchedule } from "@/features/schedules/americano-scheduler";
import { recordAuditEntry } from "@/features/audit/audit-log";
import { randomBytes } from "crypto";

export async function generateScheduleFormAction(eventId: string, prevState: any, formData: FormData) {
  try {
    const store = createDrizzleEventStore();
    const event = await store.getEvent(eventId);
    if (!event) return { error: "Event not found" };

    const action = formData.get("action")?.toString();

    // Re-generate preview based on seed
    if (action === "preview") {
      const seed = formData.get("seed")?.toString() || randomBytes(4).toString("hex");
      const playerStore = createDrizzlePlayerStore();
      const roster = await playerStore.listRoster(eventId);
      
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
        const schedule = generateAmericanoSchedule({
          players: schedulePlayers,
          courtCount: event.courtCount,
          roundCount: event.roundCount,
          seed,
        });
        
        return { preview: schedule, success: true, seed };
      }
      
      return { error: `Schedules for format ${event.format} with pairing ${event.pairingMode} are not implemented yet.` };
    }

    // Actually save the schedule to DB
    if (action === "save") {
      const rawSchedule = formData.get("scheduleData")?.toString();
      if (!rawSchedule) return { error: "No schedule data to save." };
      
      const schedule = JSON.parse(rawSchedule) as ReturnType<typeof generateAmericanoSchedule>;
      
      const matchStore = createDrizzleMatchStore();
      const auditStore = createDrizzleAuditLogStore();

      // Ensure no matches exist yet (or handle differently based on your policy)
      const existing = await matchStore.listMatches(eventId);
      if (existing.length > 0) {
        return { error: "Matches already exist for this event. Schedule generation is locked." };
      }

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
            scoreTarget: event.scoreTarget,
            status: "scheduled"
          });
        }
      }

      // Lock format/mode
      await store.updateEvent(eventId, { scheduleGenerated: true });
      await store.updateStatus(eventId, "live");

      await recordAuditEntry(auditStore, {
        actionType: "schedule_generated",
        actorId: null,
        eventId,
        entityKind: "schedule",
        entityId: eventId,
        summary: `Generated ${schedule.rounds.length} rounds of Americano schedule`,
      });

      revalidatePath(`/admin/events/${eventId}/schedule`);
      return { saved: true, success: true };
    }

    return { error: "Unknown action" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to generate schedule" };
  }
}
