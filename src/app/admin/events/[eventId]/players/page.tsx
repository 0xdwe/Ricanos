import Link from "next/link";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { BulkAddPlayersForm } from "@/features/players/bulk-add-players-form";
import { notFound } from "next/navigation";

type EventRosterPageProps = { params: Promise<{ eventId: string }> };

export default async function EventRosterPage({ params }: EventRosterPageProps) {
  const { eventId } = await params;
  
  const eventStore = createDrizzleEventStore();
  const event = await eventStore.getEvent(eventId);
  if (!event) notFound();

  const playerStore = createDrizzlePlayerStore();
  const players = await playerStore.listPlayers();
  const roster = await playerStore.listRoster(eventId);
  
  const playerById = new Map(players.map((p) => [p.id, p]));
  const rosterPlayers = roster.map(r => playerById.get(r.playerId)).filter(p => p !== undefined);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <div className="mb-4">
          <Link href={`/admin/events/${eventId}`} className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Back to Event Dashboard
          </Link>
        </div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Event roster</h1>
        <p className="mt-2 text-slate-600">Event: {event.name} • {rosterPlayers.length} players registered</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold mb-4">Add Players</h2>
            {event.pairingMode === "fixed_team" ? (
              <p className="text-sm text-slate-600">Fixed team registration is coming in a future update. For now, this event is locked to fixed_team mode.</p>
            ) : (
              <BulkAddPlayersForm eventId={eventId} />
            )}
          </section>
        </div>

        <div className="md:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold">Registered Players</h2>
            </div>
            
            {rosterPlayers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No players added yet. Use the form to add players.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {rosterPlayers.map((player, index) => (
                  <li key={player.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-slate-400 w-6">{index + 1}.</span>
                      <span className="font-medium text-slate-900">{player.displayName}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
