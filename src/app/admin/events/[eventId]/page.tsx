type EventDetailPageProps = { params: Promise<{ eventId: string }> };

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Event settings</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Lifecycle</h2>
        <p className="mt-2 text-slate-600">Draft → Ready → Live → Completed → Archived controls will connect to server actions in this slice.</p>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="mt-2 text-slate-600">Safe edits are always available. Risky edits require confirmation in a later slice.</p>
      </section>
    </main>
  );
}
