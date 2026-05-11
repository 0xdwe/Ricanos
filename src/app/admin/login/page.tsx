export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin login</p>
        <h1 className="mt-2 text-2xl font-bold">Sign in to manage events</h1>
        <p className="mt-3 text-slate-600">
          Supabase email login UI will be connected after project credentials are configured.
        </p>
      </div>
    </main>
  );
}
