type EventActivityPageProps = { params: Promise<{ eventId: string }> };

const activityExamples = [
  "Scores updated",
  "Match status changed",
  "Risky override confirmed",
  "Schedule generated or regenerated",
  "Event completed or reopened",
];

export default async function EventActivityPage({ params }: EventActivityPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Recent activity</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="activity-heading">
        <div className="flex flex-col gap-1">
          <h2 id="activity-heading" className="text-xl font-semibold">Audit log</h2>
          <p className="text-sm text-slate-600">A lightweight panel for score, status, pairing, schedule, lifecycle, and override activity.</p>
        </div>

        <ul className="mt-5 grid gap-3">
          {activityExamples.map((summary) => (
            <li key={summary} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
              {summary}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
