type FixedTeamRosterPageProps = { params: Promise<{ eventId: string }> };

export default async function FixedTeamRosterPage({ params }: FixedTeamRosterPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Fixed-team roster</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-600">Register partner pairs for fixed-team Americano round-robin or Mexicano team power-pairing.</p>
        <label className="grid gap-2 font-medium">
          Paste fixed teams
          <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="fixedTeams" rows={8} placeholder="Alice / Bob&#10;Charlie / Dana" />
        </label>
        <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white" type="button">Save fixed teams</button>
      </section>
    </main>
  );
}
