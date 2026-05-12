import Link from "next/link";
import { loadEventReadModel } from "@/features/events/event-read-model";
import { calculateLeaderboard } from "@/features/leaderboards/leaderboard-engine";
import { buildLeaderboardMatches } from "@/features/matches/match-model";
import { notFound } from "next/navigation";

type EventLeaderboardPageProps = { 
  params: Promise<{ eventId: string }>;
  searchParams?: Promise<{ sort?: string }>;
};

export default async function EventLeaderboardPage({ params, searchParams }: EventLeaderboardPageProps) {
  const { eventId } = await params;
  const { sort } = (await searchParams) ?? {};
  const sortBy = sort === "points" ? "points" : "wins";
  
  const readModel = await loadEventReadModel(eventId);
  if (!readModel) notFound();

  const { event, participants } = readModel;
  const standings = calculateLeaderboard({ 
    participants, 
    matches: buildLeaderboardMatches(readModel.matches),
    sortBy 
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <div>
        <div className="mb-4">
          <Link href={`/admin/events/${eventId}`} className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Back to Event Dashboard
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="mt-2 text-slate-600">Event: {event.name}</p>
          </div>
          <div className="flex gap-2">
            <Link 
              href={`/admin/events/${eventId}/leaderboard?sort=wins`}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${sortBy === 'wins' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              By Wins
            </Link>
            <Link 
              href={`/admin/events/${eventId}/leaderboard?sort=points`}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${sortBy === 'points' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              By Points
            </Link>
          </div>
        </div>
      </div>
      
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold">Rank</th>
              <th className="p-4 font-semibold">Player / Team</th>
              <th className="p-4 font-semibold">Win / Loss</th>
              <th className="p-4 font-semibold">Total points</th>
              <th className="p-4 font-semibold">Point +/-</th>
              <th className="p-4 font-semibold">Played</th>
              <th className="p-4 font-semibold">Win rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-slate-500" colSpan={7}>
                  {participants.length === 0 
                    ? "No players in roster yet. Go to the Roster tab to add players." 
                    : "No completed matches yet."}
                </td>
              </tr>
            ) : (
              standings.map((standing) => (
                <tr key={standing.participantId} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{standing.rank}</td>
                  <td className="p-4 font-medium text-slate-900">{standing.displayName}</td>
                  <td className="p-4 text-slate-900 font-semibold">{standing.wins} / {standing.losses}</td>
                  <td className="p-4 text-slate-900 font-bold">{standing.totalPoints}</td>
                  <td className="p-4 text-slate-600">{standing.pointDifference > 0 ? `+${standing.pointDifference}` : standing.pointDifference}</td>
                  <td className="p-4 text-slate-600">{standing.played}</td>
                  <td className="p-4 text-slate-600">{Math.round(standing.winRate * 100)}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
