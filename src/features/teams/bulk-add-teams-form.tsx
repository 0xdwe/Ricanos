"use client";

import { useActionState } from "react";
import { bulkAddTeamsFormAction } from "./team-form-actions";

export function BulkAddTeamsForm({ eventId }: { eventId: string }) {
  const action = bulkAddTeamsFormAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{state.error}</div>}
      {state?.success && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">Added {state.count} pairs.</div>}
      <label className="grid gap-2 font-medium">
        Paste player pairs
        <textarea
          className="rounded-lg border border-slate-300 px-3 py-2"
          name="teams"
          rows={8}
          placeholder={"Alice / Bob\nCarla / Dion"}
          required
        />
      </label>
      <p className="text-xs text-slate-500">One pair per line. Accepted separators: /, comma, +, &, and.</p>
      <button className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50" type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add pairs"}
      </button>
    </form>
  );
}
