"use client";

import { useActionState } from "react";
import type { EventRecord } from "./event-store";
import { deleteEventFromForm, updateEventFromForm } from "./event-form-actions";

export function EditEventForm({ event }: { event: EventRecord }) {
  const updateAction = updateEventFromForm.bind(null, event.id);
  const [state, formAction, isPending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <form action={formAction} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">Edit event</h2>
          <p className="mt-1 text-sm text-slate-600">Update core event settings. Format/pairing remain shown for clarity.</p>
        </div>
        {state?.error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{state.error}</div>}
        {state?.success && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">Changes saved.</div>}

        <label className="grid gap-2 font-medium">
          Event name
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="name" defaultValue={event.name} required />
        </label>
        <label className="grid gap-2 font-medium">
          Description
          <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="description" rows={3} defaultValue={event.description ?? ""} />
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="grid gap-2 font-medium">
            Event date
            <input className="rounded-lg border border-slate-300 px-3 py-2" name="eventDate" type="date" defaultValue={event.eventDate ?? ""} />
          </label>
          <label className="grid gap-2 font-medium">
            Venue name
            <input className="rounded-lg border border-slate-300 px-3 py-2" name="venueName" defaultValue={event.venueName ?? ""} />
          </label>
        </div>
        <label className="grid gap-2 font-medium">
          Venue address
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="venueAddress" defaultValue={event.venueAddress ?? ""} />
        </label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="grid gap-2 font-medium">
            Format
            <select className="rounded-lg border border-slate-300 px-3 py-2" name="format" defaultValue={event.format} disabled={event.scheduleGenerated}>
              <option value="americano">Americano</option>
              <option value="mexicano">Mexicano</option>
            </select>
          </label>
          <label className="grid gap-2 font-medium">
            Pairing mode
            <select className="rounded-lg border border-slate-300 px-3 py-2" name="pairingMode" defaultValue={event.pairingMode} disabled={event.scheduleGenerated}>
              <option value="individual">Individual rotation</option>
              <option value="fixed_team">Fixed teams</option>
            </select>
          </label>
        </div>
        {event.scheduleGenerated && (
          <input type="hidden" name="format" value={event.format} />
        )}
        {event.scheduleGenerated && (
          <input type="hidden" name="pairingMode" value={event.pairingMode} />
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="grid gap-2 font-medium">
            Court count
            <input className="rounded-lg border border-slate-300 px-3 py-2" name="courtCount" type="number" min={1} defaultValue={event.courtCount} />
          </label>
          <label className="grid gap-2 font-medium">
            Score target
            <input className="rounded-lg border border-slate-300 px-3 py-2" name="scoreTarget" type="number" min={1} defaultValue={event.scoreTarget} />
          </label>
          <label className="grid gap-2 font-medium">
            Round count
            <input className="rounded-lg border border-slate-300 px-3 py-2" name="roundCount" type="number" min={1} defaultValue={event.roundCount} />
          </label>
        </div>

        <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </form>

      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-xl font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-sm text-red-800">Delete this event and all related roster, rounds, matches, teams, and audit records. This action cannot be undone.</p>
        <form action={deleteEventFromForm.bind(null, event.id)} className="mt-4" onSubmit={(e) => {
          if (!confirm(`Are you sure you want to delete "${event.name}"? This will permanently delete all matches, scores, and roster data. This action cannot be undone.`)) {
            e.preventDefault();
          }
        }}>
          <button className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700" type="submit">
            Delete event
          </button>
        </form>
      </section>
    </div>
  );
}
