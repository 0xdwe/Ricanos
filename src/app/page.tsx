import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
        Ricanos Padel Community
      </p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Run Americano and Mexicano events without spreadsheet chaos.
      </h1>
      <p className="text-lg text-slate-600">
        Admins manage events and scores. Players follow public view-only leaderboards and matches.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white" href="/admin">
          Admin area
        </Link>
        <Link className="rounded-lg border border-slate-300 px-5 py-3 font-semibold" href="/events/demo">
          View demo event shell
        </Link>
      </div>
    </main>
  );
}
