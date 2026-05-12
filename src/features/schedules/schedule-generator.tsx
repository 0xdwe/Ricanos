"use client";

import { useActionState, useState } from "react";
import { generateScheduleFormAction } from "./schedule-form-actions";
export function ScheduleGenerator({ eventId, rosterCount }: { eventId: string; rosterCount: number }) {
  const generateAction = generateScheduleFormAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(generateAction, null);
  const [seed, setSeed] = useState("americano-preview");

  if (state?.saved) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Schedule Saved Successfully</h2>
        <p className="text-green-700 mb-6">The tournament is now live. You can start entering scores.</p>
        <a 
          href={`/admin/events/${eventId}/scores`}
          className="inline-block rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
        >
          Go to Score Entry
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">1. Generate Preview</h2>
        {state?.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {state.error}
          </div>
        )}
        <p className="text-slate-600 text-sm">You have {rosterCount} players. Americano works best in multiples of 4.</p>
        
        <input type="hidden" name="action" value="preview" />
        
        <label className="grid gap-2 font-medium">
          Random seed
          <div className="flex gap-2">
            <input 
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" 
              name="seed" 
              value={seed}
              onChange={(e) => setSeed(e.target.value)} 
            />
            <button 
              type="button"
              onClick={() => setSeed(Math.random().toString(36).substring(2, 8))}
              className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 font-medium hover:bg-slate-100"
            >
              Randomize
            </button>
          </div>
        </label>
        
        <button 
          className="rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white mt-2 disabled:opacity-50" 
          type="submit"
          disabled={isPending || rosterCount < 4}
        >
          {isPending ? "Generating..." : "Generate Preview"}
        </button>
      </form>

      {state?.preview && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">2. Review & Save</h2>
            <form action={formAction}>
              <input type="hidden" name="action" value="save" />
              <input type="hidden" name="scheduleData" value={JSON.stringify(state.preview)} />
              <button 
                className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50" 
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Lock & Save Schedule"}
              </button>
            </form>
          </div>
          
          {state.preview.warnings && state.preview.warnings.length > 0 && (
            <div className="bg-amber-50 p-4 border-b border-amber-200">
              <h3 className="text-sm font-bold text-amber-800 mb-1">Warnings</h3>
              <ul className="list-disc pl-5 text-sm text-amber-900">
                {state.preview.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <div className="p-6 space-y-8">
            {state.preview.rounds.map((round: any) => (
              <div key={round.roundNumber}>
                <h3 className="font-bold text-lg border-b pb-2 mb-4">Round {round.roundNumber}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {round.matches.map((match: any) => (
                    <div key={match.courtNumber} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Court {match.courtNumber}</div>
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-slate-900 text-sm">
                          {match.teamOnePlayerIds[0].substring(0,6)} + {match.teamOnePlayerIds[1].substring(0,6)}
                        </div>
                        <div className="text-slate-400 font-bold mx-2">VS</div>
                        <div className="font-medium text-slate-900 text-sm">
                          {match.teamTwoPlayerIds[0].substring(0,6)} + {match.teamTwoPlayerIds[1].substring(0,6)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
