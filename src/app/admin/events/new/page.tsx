import Link from "next/link";
import { CreateEventForm } from "@/features/events/create-event-form";

export default function NewEventPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <div className="mb-4">
          <Link href="/admin" className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Back to Events
          </Link>
        </div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-700">Admin</p>
        <h1 className="text-3xl font-bold">Create event</h1>
        <p className="mt-2 text-slate-600">Choose the basic tournament settings. Format and pairing mode lock after schedule generation.</p>
      </div>
      <CreateEventForm />
    </main>
  );
}
