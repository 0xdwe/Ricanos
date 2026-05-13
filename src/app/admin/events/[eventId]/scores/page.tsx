import { revalidatePath } from "next/cache";
import { loadEventReadModel } from "@/features/events/event-read-model";
import { generateSingleMatchAction } from "@/features/schedules/schedule-form-actions";
import { MatchCard } from "./match-card";
import { replaceParticipant, deleteMatch } from "./match-actions-server";

export const dynamic = "force-dynamic";

type EventScoresPageProps = { params: Promise<{ eventId: string }> };

export default async function EventScoresPage({ params }: EventScoresPageProps) {
  const { eventId } = await params;
  const readModel = await loadEventReadModel(eventId);
  if (!readModel) return null;
  
  const { event, matches, nameById } = readModel;
  const isMexicano = event.format === "mexicano";
  const replaceParticipantAction = replaceParticipant.bind(null, eventId);
  const deleteMatchAction = async (formData: FormData) => {
    "use server";
    const matchId = formData.get("matchId")?.toString();
    if (!matchId) return;
    await deleteMatch(eventId, matchId);
  };
  const nameByIdMap = Object.fromEntries(nameById);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 bg-slate-50 px-4 pb-24 pt-6 sm:px-6 sm:py-10">
      <div className="rounded-3xl bg-slate-950 p-6 text-slate-50 shadow-sm">
        <a href={`/admin/events/${eventId}`} className="text-sm font-medium text-blue-200 hover:text-blue-100">
          ← Back to event
        </a>
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-blue-200">Admin score desk</p>
        <h1 className="mt-1 text-3xl font-bold">Today&apos;s matches</h1>
        <p className="mt-2 text-slate-300">{event?.name ?? "Event"}</p>
      </div>

      {matches.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold">No matches yet</h2>
          <p className="mt-2 text-slate-600">Add players, then generate a match to get started.</p>
          <form action={async () => {
            "use server";
            await generateSingleMatchAction(eventId);
          }}>
            <button className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700" type="submit">
              Generate first match
            </button>
          </form>
        </section>
      ) : (
        <section className="grid gap-4">
          <form action={async () => {
            "use server";
            await generateSingleMatchAction(eventId);
          }} className="mb-2">
            <button className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-200" type="submit">
              + Generate another match
            </button>
          </form>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              eventId={eventId}
              nameByIdMap={nameByIdMap}
              isMexicano={isMexicano}
              replaceParticipantAction={replaceParticipantAction}
              deleteMatchAction={deleteMatchAction}
            />
          ))}
        </section>
      )}
    </main>
  );
}
