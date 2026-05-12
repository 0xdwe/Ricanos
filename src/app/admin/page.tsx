import Link from "next/link";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = createDrizzleEventStore();
  const events = await store.listEvents();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
          <h1 className="text-3xl font-bold">Event management</h1>
          <p className="mt-2 text-slate-600">Create and manage Americano and Mexicano events.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white" href="/admin/events/new">
            Create event
          </Link>
          <Link className="rounded-lg border border-slate-300 px-5 py-3 text-center font-semibold" href="/admin/players">
            Player directory
          </Link>
        </div>
      </div>
      
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-xl font-semibold">All Events</h2>
        </div>
        
        {events.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No events found. Create your first event to get started.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {events.map((event) => (
              <li key={event.id} className="p-6 hover:bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Link href={`/admin/events/${event.id}`} className="text-lg font-semibold text-blue-700 hover:underline">
                      {event.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 capitalize">
                        {event.status}
                      </span>
                      <span>{event.format} • {event.pairingMode.replace('_', ' ')}</span>
                      {event.eventDate && <span>📅 {format(new Date(event.eventDate), 'MMM d, yyyy')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/events/${event.publicSlug}`} 
                      target="_blank"
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded px-3 py-1.5 bg-white"
                    >
                      Public Link ↗
                    </Link>
                    <Link 
                      href={`/admin/events/${event.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Manage &rarr;
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
