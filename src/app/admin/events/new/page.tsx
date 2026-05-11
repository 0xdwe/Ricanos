export default function NewEventPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Create event</h1>
        <p className="mt-2 text-slate-600">Choose the basic tournament settings. Format and pairing mode lock after schedule generation.</p>
      </div>
      <form className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="grid gap-2 font-medium">
          Event name
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="name" required />
        </label>
        <label className="grid gap-2 font-medium">
          Description
          <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="description" rows={3} />
        </label>
        <label className="grid gap-2 font-medium">
          Event date
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="eventDate" type="date" />
        </label>
        <label className="grid gap-2 font-medium">
          Venue name
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="venueName" />
        </label>
        <label className="grid gap-2 font-medium">
          Venue address
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="venueAddress" />
        </label>
        <label className="grid gap-2 font-medium">
          Format
          <select className="rounded-lg border border-slate-300 px-3 py-2" name="format" defaultValue="americano">
            <option value="americano">Americano</option>
            <option value="mexicano">Mexicano</option>
          </select>
        </label>
        <label className="grid gap-2 font-medium">
          Pairing mode
          <select className="rounded-lg border border-slate-300 px-3 py-2" name="pairingMode" defaultValue="individual">
            <option value="individual">Individual rotation</option>
            <option value="fixed_team">Fixed teams</option>
          </select>
        </label>
        <label className="grid gap-2 font-medium">
          Court count
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="courtCount" type="number" min={1} defaultValue={2} />
        </label>
        <label className="grid gap-2 font-medium">
          Score target
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="scoreTarget" type="number" min={1} defaultValue={24} />
        </label>
        <label className="grid gap-2 font-medium">
          Round count
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="roundCount" type="number" min={1} defaultValue={6} />
        </label>
        <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white" type="submit">Create draft event</button>
      </form>
    </main>
  );
}
