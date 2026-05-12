"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createEventFromForm } from "@/features/events/event-form-actions";

export function CreateEventForm() {
  const [state, formAction, isPending] = useActionState(createEventFromForm, null);

  return (
    <form action={formAction} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
          {state.error}
        </div>
      )}
      <label className="grid gap-2 font-medium">
        Event name
        <input className="rounded-lg border border-slate-300 px-3 py-2" name="name" required />
      </label>
      <label className="grid gap-2 font-medium">
        Description
        <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="description" rows={3} />
      </label>
      <label className="grid gap-2 font-medium">
        Event date
        <input className="rounded-lg border border-slate-300 px-3 py-2" name="eventDate" type="date" />
      </label>
      <label className="grid gap-2 font-medium">
        Venue name
        <input className="rounded-lg border border-slate-300 px-3 py-2" name="venueName" />
      </label>
      <label className="grid gap-2 font-medium">
        Venue address
        <input className="rounded-lg border border-slate-300 px-3 py-2" name="venueAddress" />
      </label>
      <label className="grid gap-2 font-medium">
        Format
        <select className="rounded-lg border border-slate-300 px-3 py-2" name="format" defaultValue="americano">
          <option value="americano">Americano</option>
          <option value="mexicano">Mexicano</option>
        </select>
      </label>
      <label className="grid gap-2 font-medium">
        Pairing mode
        <select className="rounded-lg border border-slate-300 px-3 py-2" name="pairingMode" defaultValue="individual">
          <option value="individual">Individual rotation</option>
          <option value="fixed_team">Fixed teams</option>
        </select>
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className="grid gap-2 font-medium">
          Court count
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="courtCount" type="number" min={1} defaultValue={2} />
        </label>
        <label className="grid gap-2 font-medium">
          Score target
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="scoreTarget" type="number" min={1} defaultValue={24} />
        </label>
        <input type="hidden" name="roundCount" value={6} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Link href="/admin" className="text-slate-600 hover:text-slate-900 font-medium">
          Cancel
        </Link>
        <button 
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50" 
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create draft event"}
        </button>
      </div>
    </form>
  );
}
