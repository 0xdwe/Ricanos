type AmericanoSchedulePreviewPageProps = { params: Promise<{ eventId: string }> };

export default async function AmericanoSchedulePreviewPage({ params }: AmericanoSchedulePreviewPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Americano schedule preview</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Preview before saving</h2>
        <label className="grid gap-2 font-medium">
          Random seed
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="seed" defaultValue="americano-preview" />
        </label>
        <p className="text-slate-600">Generate, reshuffle, manually review, then save rounds in a later persistence slice.</p>
      </section>
    </main>
  );
}
