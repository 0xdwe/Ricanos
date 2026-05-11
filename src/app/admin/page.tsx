import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
          <h1 className="text-3xl font-bold">Event management</h1>
          <p className="mt-2 text-slate-600">Create and manage Americano and Mexicano events.</p>
        </div>
        <Link className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white" href="/admin/events/new">
          Create event
        </Link>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Events</h2>
        <p className="mt-2 text-slate-600">Database-backed event listing will appear here once Supabase is configured.</p>
      </section>
    </main>
  );
}
