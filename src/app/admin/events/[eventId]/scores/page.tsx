import { createDrizzleAuditLogStore } from "@/features/audit/drizzle-audit-log-store";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { correctMexicanoPastScoreAction, scoreMatchAction, transitionMatchStatusAction } from "@/features/matches/match-actions";
import type { MexicanoScoreCorrectionChoice } from "@/features/schedules/mexicano-score-correction";
import type { MatchStatus } from "@/features/matches/match-model";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { validateRiskyAdminChanges } from "@/features/risk/risk-validation";

type EventScoresPageProps = { params: Promise<{ eventId: string }> };

function parseOptionalScore(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return Number(value);
}

async function saveMatchUpdate(formData: FormData) {
  "use server";

  const store = createDrizzleMatchStore();
  const auditStore = createDrizzleAuditLogStore();
  const eventId = String(formData.get("eventId") ?? "").trim();
  const matchId = String(formData.get("matchId") ?? "").trim();
  const status = String(formData.get("status") ?? "scheduled") as MatchStatus;
  const teamOneScore = parseOptionalScore(formData.get("teamOneScore"));
  const teamTwoScore = parseOptionalScore(formData.get("teamTwoScore"));
  const overrideConfirmed = formData.get("overrideConfirmed") === "on";
  const abandonedCountsTowardLeaderboard = formData.get("abandonedCountsTowardLeaderboard") === "on";
  const correctionChoiceValue = formData.get("correctionChoice");
  const correctionChoice = typeof correctionChoiceValue === "string" && correctionChoiceValue.length > 0 ? (correctionChoiceValue as MexicanoScoreCorrectionChoice) : undefined;

  const existing = await store.getMatch(matchId);
  if (existing && teamOneScore !== null && teamTwoScore !== null) {
    const risk = validateRiskyAdminChanges({
      matches: [{ ...existing, status, teamOneScore, teamTwoScore }],
      originalMatches: [existing],
      overrideConfirmed,
    });
    if (!risk.canSave) return;
  }

  if (status === "completed" && teamOneScore !== null && teamTwoScore !== null) {
    const event = await loadEvent(eventId);
    if (event?.format === "mexicano") {
      await correctMexicanoPastScoreAction(store, matchId, { teamOneScore, teamTwoScore, overrideConfirmed, correctionChoice }, { store: auditStore, actorId: null });
    } else {
      await scoreMatchAction(store, matchId, { teamOneScore, teamTwoScore, overrideConfirmed }, { store: auditStore, actorId: null });
    }
    return;
  }


  await transitionMatchStatusAction(store, matchId, status, { abandonedCountsTowardLeaderboard }, { store: auditStore, actorId: null });
}

async function loadEvent(eventId: string) {
  try {
    return await createDrizzleEventStore().getEvent(eventId);
  } catch {
    return null;
  }
}

export default async function EventScoresPage({ params }: EventScoresPageProps) {
  const { eventId } = await params;
  const event = await loadEvent(eventId);
  const isMexicano = event?.format === "mexicano";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Score entry</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>

      <form action={saveMatchUpdate} className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <input type="hidden" name="eventId" value={eventId} />
        <div>
          <h2 className="text-xl font-semibold">Match controls</h2>
          <p className="mt-1 text-sm text-slate-600">Update match status, enter scores, and confirm target-total overrides when real matches end early.</p>
        </div>

        <label className="grid gap-2 font-medium">
          Match ID
          <input className="min-h-12 rounded-lg border border-slate-300 px-3 py-2" name="matchId" placeholder="match uuid" required />
        </label>

        <label className="grid gap-2 font-medium">
          Status
          <select className="min-h-12 rounded-lg border border-slate-300 px-3 py-2" name="status" defaultValue="scheduled">
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 font-medium">
            Team one score
            <input className="min-h-12 rounded-lg border border-slate-300 px-3 py-2 text-lg" name="teamOneScore" inputMode="numeric" type="number" min="0" placeholder="0" />
          </label>
          <label className="grid gap-2 font-medium">
            Team two score
            <input className="min-h-12 rounded-lg border border-slate-300 px-3 py-2 text-lg" name="teamTwoScore" inputMode="numeric" type="number" min="0" placeholder="0" />
          </label>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="font-semibold">Risk warnings require confirmation</div>
          <p className="mt-1">Score target mismatches and risky live edits are blocked until admin confirms override.</p>
          <label className="mt-3 flex items-start gap-3 font-medium">
            <input className="mt-1" name="overrideConfirmed" type="checkbox" />
            Override target total after confirmation
          </label>
        </div>

        {isMexicano ? (
          <fieldset className="grid gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
            <legend className="px-1 font-semibold">Mexicano score correction</legend>
            <p>When editing an earlier Mexicano score, later generated rounds may depend on the old standings. Completed, in-progress, and abandoned future matches are always preserved.</p>
            <label className="flex items-start gap-3 font-medium">
              <input className="mt-1" name="correctionChoice" type="radio" value="update_score_only" />
              Preserve later generated rounds
            </label>
            <label className="flex items-start gap-3 font-medium">
              <input className="mt-1" name="correctionChoice" type="radio" value="update_score_and_regenerate_unplayed_future_rounds" />
              Mark scheduled, unscored future matches for regeneration
            </label>
          </fieldset>
        ) : null}

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
          <input className="mt-1" name="abandonedCountsTowardLeaderboard" type="checkbox" />
          Count abandoned match toward leaderboard
        </label>

        <button className="min-h-12 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white" type="submit">Save match update</button>
      </form>
    </main>
  );
}
