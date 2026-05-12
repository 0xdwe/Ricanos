import { loadPublicDashboard } from "@/features/public-dashboard/public-dashboard-loader";
import type { PublicDashboardData, PublicMatchCard } from "@/features/public-dashboard/public-dashboard";

type PublicEventPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ player?: string | string[] }>;
};

export default async function PublicEventPage({ params, searchParams }: PublicEventPageProps) {
  const { slug } = await params;
  const query = normalizeSearchParam((await searchParams)?.player);
  const { dashboard, unavailable } = await safeLoadDashboard(slug, query);

  if (!dashboard && !unavailable) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">View-only public event</p>
        <h1 className="text-3xl font-bold">Event not found</h1>
        <p className="text-slate-600">Check that the public link is correct.</p>
      </main>
    );
  }

  return dashboard ? <Dashboard dashboard={dashboard} /> : <UnavailableShell slug={slug} />;
}

function normalizeSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function safeLoadDashboard(slug: string, query: string): Promise<{ dashboard: PublicDashboardData | null; unavailable: boolean }> {
  try {
    return { dashboard: await loadPublicDashboard(slug, query), unavailable: false };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Missing required environment variable")) {
      return { dashboard: null, unavailable: true };
    }
    throw error;
  }
}

function Dashboard({ dashboard }: { dashboard: PublicDashboardData }) {
  const refreshHref = dashboard.query ? `?player=${encodeURIComponent(dashboard.query)}` : "?";

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 pb-24 pt-6 sm:px-6">
      {dashboard.event.autoRefreshSeconds ? <meta httpEquiv="refresh" content={Math.max(10, dashboard.event.autoRefreshSeconds).toString()} /> : null}
      <header className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-100">View-only public event</p>
        <h1 className="mt-2 text-3xl font-bold">{dashboard.event.name}</h1>
        <p className="mt-2 text-blue-100">{formatEventMeta(dashboard)}</p>
        {dashboard.event.description ? <p className="mt-3 max-w-3xl text-blue-50">{dashboard.event.description}</p> : null}
        {dashboard.event.autoRefreshSeconds ? <p className="mt-3 text-sm text-blue-100">Auto-refresh every {dashboard.event.autoRefreshSeconds} seconds.</p> : <p className="mt-3 text-sm text-blue-100">Use refresh for latest scores.</p>}
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Leaderboard</h2>
            <p className="mt-1 text-sm text-slate-600">Ranked by average points, average point difference, win rate, then total points.</p>
          </div>
          <a className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 font-semibold" href={refreshHref}>Refresh</a>
        </div>

        <form className="mt-4 flex flex-col gap-2 sm:flex-row" action="" method="get">
          <label className="sr-only" htmlFor="player-search">Search player</label>
          <input className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3" id="player-search" name="player" placeholder="Search or highlight your name" defaultValue={dashboard.query} list="player-options" />
          <datalist id="player-options">
            {dashboard.playerOptions.map((name) => <option value={name} key={name} />)}
          </datalist>
          <button className="min-h-11 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white" type="submit">Highlight</button>
        </form>

        {dashboard.standings.length === 0 ? <p className="mt-5 text-slate-500">No players registered yet.</p> : (
          <>
            <div className="mt-5 grid gap-3 sm:hidden">
              {dashboard.standings.map((standing) => (
                <article className={`rounded-xl border p-4 ${standing.highlighted ? "border-yellow-300 bg-yellow-50" : "border-slate-200 bg-slate-50"}`} key={standing.participantId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Rank {standing.rank}</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-950">{standing.displayName}</h3>
                      {standing.highlighted ? <p className="mt-1 text-sm font-semibold text-yellow-800">Highlighted player</p> : null}
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm">{standing.averagePoints} avg</div>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div><dt className="text-slate-500">Played</dt><dd className="font-semibold">{standing.played}</dd></div>
                    <div><dt className="text-slate-500">Avg +/-</dt><dd className="font-semibold">{standing.averagePointDifference}</dd></div>
                    <div><dt className="text-slate-500">Total</dt><dd className="font-semibold">{standing.totalPoints}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="mt-5 hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3" scope="col">Rank</th>
                    <th className="p-3" scope="col">Player / Team</th>
                    <th className="p-3" scope="col">Played</th>
                    <th className="p-3" scope="col">Avg points</th>
                    <th className="p-3" scope="col">Avg +/-</th>
                    <th className="p-3" scope="col">Total points</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.standings.map((standing) => (
                    <tr className={standing.highlighted ? "bg-yellow-100" : "border-t border-slate-100"} key={standing.participantId}>
                      <td className="p-3 font-semibold">{standing.rank}</td>
                      <td className="p-3 font-medium">{standing.displayName}{standing.highlighted ? <span className="ml-2 rounded-full bg-yellow-200 px-2 py-1 text-xs text-yellow-900">Highlighted</span> : null}</td>
                      <td className="p-3">{standing.played}</td>
                      <td className="p-3">{standing.averagePoints}</td>
                      <td className="p-3">{standing.averagePointDifference}</td>
                      <td className="p-3">{standing.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <MatchSection title="Current and upcoming matches" emptyText="Matches will appear here after an admin creates the schedule." matches={dashboard.currentAndUpcomingMatches} />
      <MatchSection title="Match history" emptyText="Completed scores will appear here." matches={dashboard.matchHistory} />
      <a className="fixed inset-x-4 bottom-3 z-10 mx-auto flex min-h-12 max-w-5xl items-center justify-center rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white shadow-lg shadow-slate-900/20 sm:hidden" href={refreshHref}>Refresh scores</a>
    </main>
  );
}

function MatchSection({ title, emptyText, matches }: { title: string; emptyText: string; matches: PublicMatchCard[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold">{title}</h2>
      {matches.length === 0 ? <p className="mt-3 text-slate-600">{emptyText}</p> : (
        <div className="mt-4 grid gap-3">
          {matches.map((match) => (
            <article className={`rounded-lg border p-4 ${match.highlighted ? "border-yellow-300 bg-yellow-50" : "border-slate-200"}`} key={match.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                <span>Round {match.roundNumber} · Court {match.courtNumber}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 capitalize">{match.status.replace("_", " ")}</span>
              </div>
              <p className="mt-3 text-lg font-semibold">{match.teamOneLabel} <span className="text-slate-400">vs</span> {match.teamTwoLabel}</p>
              {match.highlighted ? <p className="mt-2 text-sm font-semibold text-yellow-800">Highlighted match</p> : null}
              {match.teamOneScore !== null && match.teamTwoScore !== null ? <p className="mt-2 text-slate-700">Score: {match.teamOneScore} - {match.teamTwoScore}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function UnavailableShell({ slug }: { slug: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 pb-24 pt-6 sm:px-6">
      <header className="rounded-xl bg-blue-600 p-6 text-white shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-100">View-only public event</p>
        <h1 className="mt-2 text-3xl font-bold">Event dashboard</h1>
        <p className="mt-2 text-blue-100">Public slug: {slug}</p>
        <p className="mt-2 text-blue-100">Leaderboard updates after refresh.</p>
      </header>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <a className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 font-semibold" href="?">Refresh</a>
        </div>
        <p className="mt-3 text-slate-600">No scores yet.</p>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold">Current and upcoming matches</h2>
        <p className="mt-3 text-slate-600">Matches will appear here after an admin creates the schedule.</p>
      </section>
      <a className="fixed inset-x-4 bottom-3 z-10 mx-auto flex min-h-12 max-w-5xl items-center justify-center rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white shadow-lg shadow-slate-900/20 sm:hidden" href="?">Refresh scores</a>
    </main>
  );
}

function formatEventMeta(dashboard: PublicDashboardData): string {
  return [dashboard.event.format, dashboard.event.pairingMode.replace("_", " "), dashboard.event.status, dashboard.event.eventDate, dashboard.event.venueName].filter(Boolean).join(" · ");
}
