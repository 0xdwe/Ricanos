type AvailabilityPageProps = { params: Promise<{ eventId: string }> };

export default async function AvailabilityPage({ params }: AvailabilityPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Round availability</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Manual rest flags</h2>
        <p className="mt-2 text-slate-600">Mark players or teams as resting/unavailable before generating the next round.</p>
      </section>
    </main>
  );
}
