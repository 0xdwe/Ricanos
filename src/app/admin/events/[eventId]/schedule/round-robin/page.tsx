type TeamRoundRobinPreviewPageProps = { params: Promise<{ eventId: string }> };

export default async function TeamRoundRobinPreviewPage({ params }: TeamRoundRobinPreviewPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Fixed-team round-robin preview</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Preview team schedule before saving</h2>
        <p className="mt-2 text-slate-600">Generate seeded team-vs-team rounds, review byes, then save in a later persistence slice.</p>
      </section>
    </main>
  );
}
