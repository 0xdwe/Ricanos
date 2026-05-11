import type { AuditEntry } from "@/features/audit/audit-log";
import { createDrizzleAuditLogStore } from "@/features/audit/drizzle-audit-log-store";

type EventActivityPageProps = { params: Promise<{ eventId: string }> };

async function loadRecentActivity(eventId: string): Promise<AuditEntry[]> {
  try {
    return await createDrizzleAuditLogStore().listRecent(eventId, 10);
  } catch {
    return [];
  }
}

function formatCreatedAt(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function EventActivityPage({ params }: EventActivityPageProps) {
  const { eventId } = await params;
  const entries = await loadRecentActivity(eventId);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Recent activity</h1>
        <p className="mt-2 text-slate-600">Event ID: {eventId}</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="activity-heading">
        <div className="flex flex-col gap-1">
          <h2 id="activity-heading" className="text-xl font-semibold">Audit log</h2>
          <p className="text-sm text-slate-600">A lightweight panel for score, status, pairing, schedule, lifecycle, and override activity.</p>
        </div>

        {entries.length === 0 ? (
          <p className="mt-5 rounded-lg border border-slate-200 p-3 text-sm text-slate-600">No recent activity recorded yet.</p>
        ) : (
          <ul className="mt-5 grid gap-3">
            {entries.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <div className="font-medium text-slate-900">{entry.summary}</div>
                <div className="mt-1 text-xs text-slate-500">{entry.actionType} · {entry.entityKind}:{entry.entityId} · {formatCreatedAt(entry.createdAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
