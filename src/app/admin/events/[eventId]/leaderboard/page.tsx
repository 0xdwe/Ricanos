type EventLeaderboardPageProps = { params: Promise<{ eventId: string }> };

export default async function EventLeaderboardPage({ params }: EventLeaderboardPageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Player / Team</th>
              <th className="p-3">Played</th>
              <th className="p-3">Avg points</th>
              <th className="p-3">Avg +/-</th>
              <th className="p-3">Win rate</th>
              <th className="p-3">Total points</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 text-slate-500" colSpan={7}>No completed matches yet.</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
