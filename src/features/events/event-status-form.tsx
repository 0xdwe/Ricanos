import type { EventStatus } from "./event-model";
import { transitionEventStatusFormAction } from "./event-status-actions";

export function EventStatusForm({ eventId, status }: { eventId: string; status: EventStatus }) {
  const isLive = status === "live";
  const isCompleted = status === "completed";
  const nextStatus = isLive ? "completed" : isCompleted ? "live" : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Event status</h2>
      <p className="mt-1 text-sm text-slate-600">
        Current status: <span className="font-semibold capitalize text-slate-900">{status}</span>
      </p>
      {nextStatus ? (
        <form action={transitionEventStatusFormAction.bind(null, eventId, nextStatus)} className="mt-4">
          <button
            type="submit"
            className={isLive ? "w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700" : "w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"}
          >
            {isLive ? "Finish event" : "Reopen event"}
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Generate a schedule to set this event live.</p>
      )}
    </section>
  );
}
