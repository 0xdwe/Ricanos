import { revalidatePath } from "next/cache";
import { createDrizzleAuditLogStore } from "@/features/audit/drizzle-audit-log-store";
import { loadEventReadModel } from "@/features/events/event-read-model";
import { correctMexicanoPastScoreAction, scoreMatchAction, transitionMatchStatusAction } from "@/features/matches/match-actions";
import type { MexicanoScoreCorrectionChoice } from "@/features/schedules/mexicano-score-correction";
import type { MatchStatus } from "@/features/matches/match-model";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { validateRiskyAdminChanges } from "@/features/risk/risk-validation";
import { replaceMatchParticipantFormAction } from "@/features/matches/match-participant-actions";

export const dynamic = "force-dynamic";

type EventScoresPageProps = { params: Promise<{ eventId: string }> };

function parseOptionalScore(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return Number(value);
}

async function saveMatchUpdate(formData: FormData) {
  "use server";

  const store = createDrizzleMatchStore();
  const auditStore = createDrizzleAuditLogStore();
  const matchId = String(formData.get("matchId") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const status = String(formData.get("status") ?? "completed") as MatchStatus;
  const teamOneScore = parseOptionalScore(formData.get("teamOneScore"));
  const teamTwoScore = parseOptionalScore(formData.get("teamTwoScore"));
  const overrideConfirmed = formData.get("overrideConfirmed") === "on";
  const abandonedCountsTowardLeaderboard = formData.get("abandonedCountsTowardLeaderboard") === "on";
  const correctionChoiceValue = formData.get("correctionChoice");
  const correctionChoice = typeof correctionChoiceValue === "string" && correctionChoiceValue.length > 0 ? (correctionChoiceValue as MexicanoScoreCorrectionChoice) : undefined;

  const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(matchId);
  if (!uuidLike) {
    throw new Error("Invalid match ID provided.");
  }

  const existing = await store.getMatch(matchId);
  if (!existing) return;
  
  const readModel = await loadEventReadModel(existing.eventId);
  if (!readModel) return;
  const event = readModel.event;

  if (teamOneScore !== null && teamTwoScore !== null) {
    const risk = validateRiskyAdminChanges({
      matches: [{ ...existing, status, teamOneScore, teamTwoScore }],
      originalMatches: [existing],
      overrideConfirmed,
    });
    if (!risk.canSave) return;
  }

  if (status === "completed" && teamOneScore !== null && teamTwoScore !== null) {
    if (event.format === "mexicano") {
      await correctMexicanoPastScoreAction(store, matchId, { teamOneScore, teamTwoScore, overrideConfirmed, correctionChoice }, { store: auditStore, actorId: null });
    } else {
      await scoreMatchAction(store, matchId, { teamOneScore, teamTwoScore, overrideConfirmed }, { store: auditStore, actorId: null });
    }
  } else {
    await transitionMatchStatusAction(store, matchId, status, { abandonedCountsTowardLeaderboard }, { store: auditStore, actorId: null });
  }

  if (eventId) {
    revalidatePath(`/admin/events/${eventId}/scores`);
    revalidatePath(`/admin/events/${eventId}/leaderboard`);
    if (event?.publicSlug) revalidatePath(`/events/${event.publicSlug}`);
  }
}

function namesFor(ids: string[], nameById: Map<string, string>) {
  return ids.map((id) => nameById.get(id) ?? "Unknown player").join(" + ");
}

export default async function EventScoresPage({ params }: EventScoresPageProps) {
  const { eventId } = await params;
  const readModel = await loadEventReadModel(eventId);
  if (!readModel) return null;
  
  const { event, matches, nameById } = readModel;
  const isMexicano = event.format === "mexicano";
  const replaceParticipantAction = replaceMatchParticipantFormAction.bind(null, eventId);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 bg-slate-50 px-4 pb-24 pt-6 sm:px-6 sm:py-10">
      <div className="rounded-3xl bg-slate-950 p-6 text-slate-50 shadow-sm">
        <a href={`/admin/events/${eventId}`} className="text-sm font-medium text-blue-200 hover:text-blue-100">
          ← Back to event
        </a>
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-blue-200">Admin score desk</p>
        <h1 className="mt-1 text-3xl font-bold">Today&apos;s matches</h1>
        <p className="mt-2 text-slate-300">{event?.name ?? "Event"}</p>
      </div>

      {matches.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold">No matches yet</h2>
          <p className="mt-2 text-slate-600">Add players, generate the schedule, then return here to score each match.</p>
        </section>
      ) : (
        <section className="grid gap-4">
          {matches.map((match) => (
            <form key={match.id} action={saveMatchUpdate} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <input type="hidden" name="eventId" value={eventId} />
              <input type="hidden" name="matchId" value={match.id} />
              <input type="hidden" name="status" value="completed" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-blue-700">Round {match.roundNumber} • Court {match.courtNumber}</div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{match.status.replace("_", " ")}</div>
                </div>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" type="submit">Save score</button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <label className="grid gap-2">
                  <span className="font-semibold text-slate-900">{namesFor(match.teamOneParticipantIds, nameById)}</span>
                  <input className="min-h-14 rounded-xl border border-slate-300 px-4 text-2xl font-bold" name="teamOneScore" inputMode="numeric" type="number" min="0" defaultValue={match.teamOneScore ?? ""} placeholder="0" />
                </label>
                <div className="hidden pb-4 text-sm font-bold text-slate-400 sm:block">VS</div>
                <label className="grid gap-2">
                  <span className="font-semibold text-slate-900">{namesFor(match.teamTwoParticipantIds, nameById)}</span>
                  <input className="min-h-14 rounded-xl border border-slate-300 px-4 text-2xl font-bold" name="teamTwoScore" inputMode="numeric" type="number" min="0" defaultValue={match.teamTwoScore ?? ""} placeholder="0" />
                </label>
              </div>

              <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <summary className="cursor-pointer font-medium">More options</summary>
                <div className="mt-3 grid gap-3">
                  <label className="flex items-center gap-2"><input name="overrideConfirmed" type="checkbox" /> Override score target total</label>
                  <label className="flex items-center gap-2"><input name="abandonedCountsTowardLeaderboard" type="checkbox" /> Count abandoned match toward leaderboard</label>
                  {isMexicano ? <input type="hidden" name="correctionChoice" value="update_score_only" /> : null}
                </div>
              </details>

              {match.status !== "completed" && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <div className="font-semibold">Player unavailable?</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {[...match.teamOneParticipantIds, ...match.teamTwoParticipantIds].map((participantId) => (
                      <button
                        key={participantId}
                        formAction={replaceParticipantAction}
                        name="participantId"
                        value={participantId}
                        className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-left font-medium text-amber-950 hover:bg-amber-100"
                        type="submit"
                      >
                        Replace {nameById.get(participantId) ?? "Unknown player"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ))}
        </section>
      )}
    </main>
  );
}
