"use client";

import { useActionState, useState } from "react";
import { importPlayersFormAction } from "./player-form-actions";

export function BulkAddPlayersForm({ eventId }: { eventId: string }) {
  const importAction = importPlayersFormAction.bind(null, eventId);
  const [state, formAction, isPending] = useActionState(importAction, null);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Clear the input immediately upon submit so user can paste more
    setTimeout(() => {
      if (!state?.error) setInput("");
    }, 100);
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="grid gap-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200">
          {state.message}
        </div>
      )}
      
      <div>
        <label htmlFor="multilineNames" className="block text-sm font-medium text-slate-700">
          Paste multiple names (one per line)
        </label>
        <p className="mt-1 text-xs text-slate-500">
          We will automatically reuse existing players if their names match.
        </p>
        <textarea
          id="multilineNames"
          name="multilineNames"
          rows={6}
          className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Alice&#10;Bob&#10;Charlie"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || input.trim().length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add to Roster"}
        </button>
      </div>
    </form>
  );
}
