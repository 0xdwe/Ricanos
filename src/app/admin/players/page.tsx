export default function PlayerDirectoryPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Player directory</h1>
        <p className="mt-2 text-slate-600">Reusable players can be added to future event rosters.</p>
      </div>
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="grid gap-2 font-medium">
          Add player name
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="playerName" />
        </label>
        <label className="grid gap-2 font-medium">
          Paste player list
          <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="playerList" rows={8} />
        </label>
        <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white" type="button">Save players</button>
      </section>
    </main>
  );
}
