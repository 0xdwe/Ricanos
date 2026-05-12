import Link from "next/link";

export default function PlayerDirectoryPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Player directory</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          You usually do not need this page during an event. Add players from the event roster screen; names are saved here automatically for reuse.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold">Recommended flow</h2>
        <ol className="mt-4 grid gap-3 text-sm text-slate-700">
          <li className="rounded-xl bg-white p-4 shadow-sm"><strong>1.</strong> Create or open today&apos;s event.</li>
          <li className="rounded-xl bg-white p-4 shadow-sm"><strong>2.</strong> Go to Roster and paste player names.</li>
          <li className="rounded-xl bg-white p-4 shadow-sm"><strong>3.</strong> Generate schedule, then enter scores from match cards.</li>
        </ol>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/admin" className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700">
            Back to events
          </Link>
          <Link href="/admin/events/new" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-800 hover:bg-slate-100">
            Create event
          </Link>
        </div>
      </section>
    </main>
  );
}
