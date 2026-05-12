import Link from "next/link";
import { createDrizzleEventStore } from "@/features/events/drizzle-event-store";
import { createDrizzlePlayerStore } from "@/features/players/drizzle-player-store";
import { createDrizzleMatchStore } from "@/features/matches/drizzle-match-store";
import { ScheduleGenerator } from "@/features/schedules/schedule-generator";
import { notFound } from "next/navigation";

type AmericanoSchedulePreviewPageProps = { params: Promise<{ eventId: string }> };

export default async function AmericanoSchedulePreviewPage({ params }: AmericanoSchedulePreviewPageProps) {
  const { eventId } = await params;

  const eventStore = createDrizzleEventStore();
  const event = await eventStore.getEvent(eventId);
  if (!event) notFound();

  const playerStore = createDrizzlePlayerStore();
  const roster = await playerStore.listRoster(eventId);
  
  const matchStore = createDrizzleMatchStore();
  const matches = await matchStore.listMatches(eventId);
  
  const isGenerated = matches.length > 0 || event.scheduleGenerated;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <div className="mb-4">
          <Link href={`/admin/events/${eventId}`} className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Back to Event Dashboard
          </Link>
        </div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Americano schedule</h1>
        <p className="mt-2 text-slate-600">Event: {event.name}</p>
      </div>
      
      {isGenerated ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Schedule Already Generated</h2>
          <p className="text-blue-700 mb-6">The tournament is active and scores are being entered. To protect data integrity, regeneration is locked.</p>
          <div className="flex justify-center gap-4">
            <Link 
              href={`/admin/events/${eventId}/scores`}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
            >
              Go to Score Entry
            </Link>
            <Link 
              href={`/admin/events/${eventId}/players`}
              className="rounded-lg border border-blue-300 bg-white px-5 py-2.5 font-semibold text-blue-800 hover:bg-blue-100"
            >
              View Roster
            </Link>
          </div>
        </div>
      ) : (
        <ScheduleGenerator eventId={eventId} rosterCount={roster.length} />
      )}
    </main>
  );
}
