import { scoreMatchAction, transitionMatchStatusAction } from "@/features/matches/match-actions";
import type { MatchStatus } from "@/features/matches/match-model";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";

type EventScoresPageProps = { params: Promise<{ eventId: string }> };

function parseOptionalScore(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return Number(value);
}

async function saveMatchUpdate(formData: FormData) {
  "use server";

  const store = createDrizzleMatchStore();
  const matchId = String(formData.get("matchId") ?? "").trim();
  const status = String(formData.get("status") ?? "scheduled") as MatchStatus;
  const teamOneScore = parseOptionalScore(formData.get("teamOneScore"));
  const teamTwoScore = parseOptionalScore(formData.get("teamTwoScore"));
  const overrideConfirmed = formData.get("overrideConfirmed") === "on";
  const abandonedCountsTowardLeaderboard = formData.get("abandonedCountsTowardLeaderboard") === "on";

  if (status === "completed" && teamOneScore !== null && teamTwoScore !== null) {
    await scoreMatchAction(store, matchId, { teamOneScore, teamTwoScore, overrideConfirmed });
    return;
  }

  await transitionMatchStatusAction(store, matchId, status, { abandonedCountsTowardLeaderboard });
}

export default async function EventScoresPage({ params }: EventScoresPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Score entry</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>

      <form action={saveMatchUpdate} className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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

        <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
          <input className="mt-1" name="overrideConfirmed" type="checkbox" />
          Override target total after confirmation
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
          <input className="mt-1" name="abandonedCountsTowardLeaderboard" type="checkbox" />
          Count abandoned match toward leaderboard
        </label>

        <button className="min-h-12 rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white" type="submit">Save match update</button>
      </form>
    </main>
  );
}
