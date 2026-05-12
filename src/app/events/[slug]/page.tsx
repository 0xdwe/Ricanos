import { loadPublicDashboard } from "@/features/public-dashboard/public-dashboard-loader";
import type { PublicDashboardData, PublicMatchCard } from "@/features/public-dashboard/public-dashboard";

type PublicEventPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ player?: string | string[]; sort?: string | string[] }>;
};

export default async function PublicEventPage({ params, searchParams }: PublicEventPageProps) {
  const { slug } = await params;
  const query = normalizeSearchParam((await searchParams)?.player);
  const sortByParam = normalizeSearchParam((await searchParams)?.sort);
  const sortBy = sortByParam === "points" ? "points" : "wins";
  const { dashboard, unavailable } = await safeLoadDashboard(slug, query, sortBy);

  if (!dashboard && !unavailable) {
    return (
      <main className="flex min-h-screen flex-col gap-4 bg-slate-950 py-8">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">View-only public event</p>
          <h1 className="text-3xl font-bold text-white">Event not found</h1>
          <p className="text-slate-400">Check that the public link is correct.</p>
        </div>
      </main>
    );
  }

  return dashboard ? <Dashboard dashboard={dashboard} sortBy={sortBy} /> : <UnavailableShell slug={slug} />;
}

function normalizeSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function safeLoadDashboard(slug: string, query: string, sortBy: "wins" | "points"): Promise<{ dashboard: PublicDashboardData | null; unavailable: boolean }> {
  try {
    return { dashboard: await loadPublicDashboard(slug, query, sortBy), unavailable: false };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Missing required environment variable")) {
      return { dashboard: null, unavailable: true };
    }
    throw error;
  }
}

function Dashboard({ dashboard, sortBy }: { dashboard: PublicDashboardData, sortBy: "wins" | "points" }) {
  const refreshHref = dashboard.query ? `?player=${encodeURIComponent(dashboard.query)}&sort=${sortBy}` : `?sort=${sortBy}`;
  const winsHref = dashboard.query ? `?player=${encodeURIComponent(dashboard.query)}&sort=wins` : `?sort=wins`;
  const pointsHref = dashboard.query ? `?player=${encodeURIComponent(dashboard.query)}&sort=points` : `?sort=points`;

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-slate-950 pb-24 pt-6">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 flex flex-col gap-6">
        {dashboard.event.autoRefreshSeconds ? <meta httpEquiv="refresh" content={`${Math.max(10, dashboard.event.autoRefreshSeconds)};url=${refreshHref}`} /> : null}
        
        <header className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-xl shadow-blue-500/10 sm:p-12 ring-1 ring-white/10">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Public dashboard</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{dashboard.event.name}</h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {[dashboard.event.format, dashboard.event.pairingMode.replace("_", " "), dashboard.event.status, dashboard.event.eventDate, dashboard.event.venueName].filter(Boolean).map((tag, i) => (
                <span key={i} className="rounded-full bg-white/5 px-3 py-1 text-sm font-medium text-slate-300 capitalize backdrop-blur-sm ring-1 ring-white/10">{tag}</span>
              ))}
            </div>
            {dashboard.event.description ? <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">{dashboard.event.description}</p> : null}
            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-slate-400">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"></span>
              {dashboard.event.autoRefreshSeconds ? `Auto-refreshing every ${dashboard.event.autoRefreshSeconds}s` : "Live scoring active"}
            </div>
          </div>
          <DecorativeBlob />
        </header>

        <section className="rounded-2xl bg-slate-900 p-6 shadow-xl shadow-blue-500/5 sm:p-8 ring-1 ring-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Leaderboard</h2>
              <p className="mt-1 text-sm text-slate-400">Standings update automatically after each match.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg bg-slate-800/50 p-1 ring-1 ring-white/10">
                <a 
                  href={winsHref}
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors ${sortBy === 'wins' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  By Wins
                </a>
                <a 
                  href={pointsHref}
                  className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors ${sortBy === 'points' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  By Points
                </a>
              </div>
              <RefreshButton href={refreshHref} />
            </div>
          </div>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="" method="get">
            <input type="hidden" name="sort" value={sortBy} />
            <label className="sr-only" htmlFor="player-search">Search player</label>
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input className="block w-full rounded-xl border-0 bg-slate-800 py-3 pl-10 pr-4 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6" id="player-search" name="player" placeholder="Search to highlight your name..." defaultValue={dashboard.query} list="player-options" />
            </div>
            <datalist id="player-options">
              {dashboard.playerOptions.map((name) => <option value={name} key={name} />)}
            </datalist>
            <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500" type="submit">Highlight</button>
          </form>

          {dashboard.standings.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 py-12 text-center">
              <h3 className="text-sm font-semibold text-slate-300">No players yet</h3>
              <p className="mt-1 text-sm text-slate-500">Standings will appear once the event starts.</p>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 sm:hidden">
                {dashboard.standings.map((standing) => (
                  <article className={`relative overflow-hidden rounded-2xl p-5 transition-all ${getHighlightClasses(standing.highlighted, 'card')}`} key={standing.participantId}>
                    <HighlightAccent show={standing.highlighted} />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={getRankBadgeClasses(standing.rank, 'lg')}>
                          {standing.rank}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{standing.displayName}</h3>
                          {standing.highlighted && <span className="inline-flex items-center rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300 ring-1 ring-blue-500/30">Highlighted</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-700 pt-5 text-center">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">W/L</dt>
                        <dd className="mt-1 text-lg font-bold text-white">{standing.wins}-{standing.losses}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</dt>
                        <dd className="mt-1 text-lg font-bold text-white">{standing.totalPoints}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Played</dt>
                        <dd className="mt-1 text-lg font-bold text-white">{standing.played}</dd>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-8 hidden overflow-hidden rounded-xl ring-1 ring-white/10 shadow-xl sm:block">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Rank</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Player / Team</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">W / L</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Total</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Point +/-</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Played</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {dashboard.standings.map((standing) => (
                      <tr className={`transition-colors ${getHighlightClasses(standing.highlighted, 'table-row')}`} key={standing.participantId}>
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-bold text-white">
                          <div className={getRankBadgeClasses(standing.rank, 'sm')}>
                            {standing.rank}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-white">
                          <div className="flex items-center gap-2">
                            {standing.displayName}
                            {standing.highlighted && <span className="inline-flex items-center rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300 ring-1 ring-blue-500/30">You</span>}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-semibold text-slate-400">{standing.wins} / {standing.losses}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-bold text-white">{standing.totalPoints}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium text-slate-400">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getPointDiffClasses(standing.pointDifference)}`}>
                            {standing.pointDifference > 0 ? `+${standing.pointDifference}` : standing.pointDifference}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium text-slate-400">{standing.played}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <MatchSection title="Live & Upcoming" emptyText="Waiting for the schedule to be generated." matches={dashboard.currentAndUpcomingMatches} />
        <MatchSection title="Recent Results" emptyText="No completed matches yet." matches={dashboard.matchHistory} />
      </div>
      
      <FloatingRefreshButton href={refreshHref} label="Refresh Live Scores" />
    </main>
  );
}

function MatchSection({ title, emptyText, matches }: { title: string; emptyText: string; matches: PublicMatchCard[] }) {
  return (
    <section className="rounded-2xl bg-slate-900 p-6 shadow-xl shadow-blue-500/5 sm:p-8 ring-1 ring-white/10">
      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
      {matches.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 py-10 text-center">
          <p className="text-sm text-slate-500">{emptyText}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {matches.map((match) => (
            <article className={`relative overflow-hidden rounded-xl p-5 transition-all ${getHighlightClasses(match.highlighted, 'card')}`} key={match.id}>
              <HighlightAccent show={match.highlighted} />
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>R{match.roundNumber} &bull; C{match.courtNumber}</span>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(match.status)}`}>
                  {match.status === "completed" ? "Done" : "Up next"}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-base font-bold text-white">{match.teamOneLabel}</p>
                  <p className="mt-2 text-base font-bold text-white">{match.teamTwoLabel}</p>
                </div>
                {match.teamOneScore !== null && match.teamTwoScore !== null ? (
                  <div className="flex flex-col items-end gap-2 text-xl font-black tabular-nums tracking-tight">
                    <span className={match.teamOneScore >= match.teamTwoScore ? "text-white" : "text-slate-600"}>{match.teamOneScore}</span>
                    <span className={match.teamTwoScore >= match.teamOneScore ? "text-white" : "text-slate-600"}>{match.teamTwoScore}</span>
                  </div>
                ) : <div className="text-sm font-medium text-slate-500">VS</div>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function UnavailableShell({ slug }: { slug: string }) {
  return (
    <main className="flex min-h-screen flex-col gap-6 bg-slate-950 pb-24 pt-6">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 flex flex-col gap-6">
        <header className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-xl shadow-blue-500/10 sm:p-12 ring-1 ring-white/10">
          <div className="relative z-10 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">View-only public event</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Dashboard Unavailable</h1>
            <p className="mt-4 text-lg text-slate-300">Public slug: {slug}</p>
            <div className="mt-8 flex items-center justify-center gap-4 sm:justify-start">
              <a className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-500" href="?">Try Again</a>
            </div>
          </div>
          <DecorativeBlob />
        </header>

        <section className="rounded-2xl bg-slate-900 p-6 shadow-xl shadow-blue-500/5 sm:p-8 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-white">Leaderboard</h2>
            <RefreshButton href="?" />
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 py-10 text-center">
            <p className="text-sm text-slate-500">No scores yet.</p>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 p-6 shadow-xl shadow-blue-500/5 sm:p-8 ring-1 ring-white/10">
          <h2 className="text-2xl font-bold tracking-tight text-white">Current and upcoming matches</h2>
          <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 py-10 text-center">
            <p className="text-sm text-slate-500">Matches will appear here after an admin creates the schedule.</p>
          </div>
        </section>
      </div>
      
      <FloatingRefreshButton href="?" label="Refresh scores" />
    </main>
  );
}

function getRankBadgeClasses(rank: number, size: 'sm' | 'lg' = 'sm') {
  const sizeClasses = size === 'lg' ? 'h-12 w-12 text-lg' : 'h-8 w-8';
  const colorClasses = rank <= 3 
    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
    : 'bg-slate-700 text-slate-300';
  return `flex items-center justify-center rounded-full font-bold ${sizeClasses} ${colorClasses}`;
}

function getHighlightClasses(highlighted: boolean, variant: 'card' | 'table-row' = 'card') {
  if (variant === 'table-row') {
    return highlighted ? 'bg-blue-950/30' : 'hover:bg-slate-800/50';
  }
  return highlighted 
    ? 'bg-blue-950/50 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
    : 'bg-slate-800/50 hover:bg-slate-800 ring-1 ring-white/10';
}

function HighlightAccent({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />;
}

function getStatusBadgeClasses(status: string) {
  return status === 'completed'
    ? 'bg-slate-700 text-slate-300'
    : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/30';
}

function getPointDiffClasses(diff: number) {
  if (diff > 0) return 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/30';
  if (diff < 0) return 'bg-red-500/20 text-red-300 ring-1 ring-inset ring-red-500/30';
  return 'bg-slate-700/50 text-slate-400 ring-1 ring-inset ring-slate-600/30';
}

function DecorativeBlob() {
  return (
    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl mix-blend-screen sm:-right-10 sm:-top-10 sm:h-96 sm:w-96" />
  );
}

function RefreshButton({ href }: { href: string }) {
  return (
    <a 
      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700 hover:text-white ring-1 ring-white/10" 
      href={href}
    >
      Refresh
    </a>
  );
}

function FloatingRefreshButton({ href, label }: { href: string; label: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden">
      <a 
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-xl shadow-blue-500/30 backdrop-blur-md transition-transform active:scale-[0.98]" 
        href={href}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        {label}
      </a>
    </div>
  );
}
