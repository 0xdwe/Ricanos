"use client";

import { useActionState } from "react";
import { saveMatchUpdate } from "./match-actions-server";

export function MatchCard({
  match,
  eventId,
  nameByIdMap,
  isMexicano,
  replaceParticipantAction,
}: {
  match: any;
  eventId: string;
  nameByIdMap: Record<string, string>;
  isMexicano: boolean;
  replaceParticipantAction: any;
}) {
  const [state, formAction, isPending] = useActionState(saveMatchUpdate, null);

  const teamOneNames = match.teamOneParticipantIds.map((id: string) => nameByIdMap[id] ?? "Unknown").join(" + ");
  const teamTwoNames = match.teamTwoParticipantIds.map((id: string) => nameByIdMap[id] ?? "Unknown").join(" + ");

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="matchId" value={match.id} />
      <input type="hidden" name="status" value="completed" />
      
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-blue-700">Round {match.roundNumber} • Court {match.courtNumber}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{match.status.replace("_", " ")}</div>
        </div>
        <div className="flex items-center gap-3">
          {state?.error && <span className="text-sm font-semibold text-red-600 max-w-xs">{state.error}</span>}
          {state?.success && <span className="text-sm font-semibold text-green-600">Saved</span>}
          <button disabled={isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50" type="submit">
            {isPending ? "Saving..." : "Save score"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="grid gap-2">
          <span className="font-semibold text-slate-900">{teamOneNames}</span>
          <input className="min-h-14 rounded-xl border border-slate-300 px-4 text-2xl font-bold" name="teamOneScore" inputMode="numeric" type="number" min="0" defaultValue={match.teamOneScore ?? ""} placeholder="0" />
        </label>
        <div className="hidden pb-4 text-sm font-bold text-slate-400 sm:block">VS</div>
        <label className="grid gap-2">
          <span className="font-semibold text-slate-900">{teamTwoNames}</span>
          <input className="min-h-14 rounded-xl border border-slate-300 px-4 text-2xl font-bold" name="teamTwoScore" inputMode="numeric" type="number" min="0" defaultValue={match.teamTwoScore ?? ""} placeholder="0" />
        </label>
      </div>

      <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        <summary className="cursor-pointer font-medium">More options</summary>
        <div className="mt-3 grid gap-3">
          <label className="flex items-center gap-2"><input name="abandonedCountsTowardLeaderboard" type="checkbox" /> Count abandoned match toward leaderboard</label>
          {isMexicano ? <input type="hidden" name="correctionChoice" value="update_score_only" /> : null}
        </div>
      </details>

      {match.status !== "completed" && (
        <details className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <summary className="cursor-pointer font-semibold">Player unavailable?</summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[...match.teamOneParticipantIds, ...match.teamTwoParticipantIds].map((participantId) => (
              <button
                key={participantId}
                formAction={replaceParticipantAction}
                name="participantId"
                value={participantId}
                className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-left font-medium text-amber-950 hover:bg-amber-100"
                type="submit"
              >
                Replace {nameByIdMap[participantId] ?? "Unknown player"}
              </button>
            ))}
          </div>
        </details>
      )}
    </form>
  );
}