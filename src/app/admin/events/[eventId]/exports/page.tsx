type EventExportsPageProps = { params: Promise<{ eventId: string }> };

const exports = [
  { kind: "leaderboard", label: "Download leaderboard CSV", description: "Current standings with rank, averages, wins, and total points." },
  { kind: "matches", label: "Download matches CSV", description: "Full match list with participants, scores, statuses, and update times." },
  { kind: "scores", label: "Download scores CSV", description: "Score-focused rows for quick analysis." },
  { kind: "event", label: "Download event metadata CSV", description: "Event settings, venue details, courts, and lifecycle state." },
] as const;

export default async function EventExportsPage({ params }: EventExportsPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">CSV exports</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>

      <section className="grid gap-3">
        {exports.map((item) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={item.kind}>
            <h2 className="text-xl font-semibold">{item.label.replace("Download ", "").replace(" CSV", "")}</h2>
            <p className="mt-2 text-slate-600">{item.description}</p>
            <a className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white" href={`/admin/events/${eventId}/exports/${item.kind}`}>
              {item.label}
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
