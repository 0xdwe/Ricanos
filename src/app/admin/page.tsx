export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Event management</h1>
        <p className="mt-2 text-slate-600">
          Create and manage Americano and Mexicano events. Event creation arrives in the next slice.
        </p>
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">No events yet</h2>
        <p className="mt-2 text-slate-600">This shell is protected by Supabase Auth.</p>
      </section>
    </main>
  );
}
