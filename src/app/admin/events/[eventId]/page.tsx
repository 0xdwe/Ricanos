import Link from "next/link";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { EventStatusForm } from "@/features/events/event-status-form";
import { notFound } from "next/navigation";

type EventDetailPageProps = { params: Promise<{ eventId: string }> };

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;
  
  const store = createDrizzleEventStore();
  const event = await store.getEvent(eventId);
  
  if (!event) {
    notFound();
  }

  const publicUrl = `/events/${event.publicSlug}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <div className="mb-4">
          <Link href="/admin" className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Back to Events
          </Link>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <div className="mt-2 flex gap-3 text-slate-600 text-sm">
              <span className="capitalize px-2 py-0.5 bg-slate-100 rounded-full font-medium">{event.status}</span>
              <span className="capitalize">{event.format}</span>
              <span className="capitalize">{event.pairingMode.replace('_', ' ')}</span>
            </div>
          </div>
          <Link 
            href={publicUrl}
            target="_blank" 
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700 shadow-sm"
          >
            <span>View Public Dashboard</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/admin/events/${event.id}/players`} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition">
              <h3 className="font-bold text-lg">1. Roster</h3>
              <p className="mt-1 text-sm text-slate-500">Manage players and teams</p>
            </Link>
            <Link href={`/admin/events/${event.id}/schedule/${event.format}`} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition">
              <h3 className="font-bold text-lg">2. Schedule</h3>
              <p className="mt-1 text-sm text-slate-500">Generate or edit rounds</p>
            </Link>
            <Link href={`/admin/events/${event.id}/scores`} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition">
              <h3 className="font-bold text-lg">3. Scores</h3>
              <p className="mt-1 text-sm text-slate-500">Enter match results</p>
            </Link>
            <Link href={`/admin/events/${event.id}/leaderboard`} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition">
              <h3 className="font-bold text-lg">4. Leaderboard</h3>
              <p className="mt-1 text-sm text-slate-500">View current standings</p>
            </Link>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Event Configuration</h2>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500 font-medium">Courts</dt>
                <dd className="font-semibold">{event.courtCount}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Score Target</dt>
                <dd className="font-semibold">{event.scoreTarget}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Total Rounds</dt>
                <dd className="font-semibold">{event.roundCount}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-medium">Public Slug</dt>
                <dd className="font-mono text-xs">{event.publicSlug}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <EventStatusForm eventId={event.id} status={event.status} />

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold mb-4">Share Links</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Public Link</label>
                <div className="mt-1 flex items-center gap-2">
                  <input 
                    readOnly 
                    value={`http://localhost:3000${publicUrl}`}
                    className="w-full text-xs font-mono p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Anyone with this link can view the schedule and scores. They cannot edit.</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Exports</h2>
            <Link href={`/admin/events/${event.id}/exports`} className="block w-full rounded bg-slate-100 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-200">
              Download CSV data
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
