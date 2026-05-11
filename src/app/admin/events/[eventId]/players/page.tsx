type EventRosterPageProps = { params: Promise<{ eventId: string }> };

export default async function EventRosterPage({ params }: EventRosterPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Event roster</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Add reusable players</h2>
        <p className="mt-2 text-slate-600">Search and roster attachment will connect to the tested player actions.</p>
      </section>
    </main>
  );
}
