type PublicEventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-100">View-only public event</p>
        <h1 className="mt-2 text-3xl font-bold">Event dashboard</h1>
        <p className="mt-2 text-blue-100">Public slug: {slug}</p>
        <p className="mt-2 text-blue-100">Leaderboard updates after refresh. Auto-refresh arrives in a later slice.</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <button className="rounded-lg border border-slate-300 px-4 py-2 font-semibold" type="button">
            Refresh
          </button>
        </div>
        <p className="mt-3 text-slate-600">No scores yet.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Current and upcoming matches</h2>
        <p className="mt-3 text-slate-600">Matches will appear here after an admin creates the schedule.</p>
      </section>
    </main>
  );
}
