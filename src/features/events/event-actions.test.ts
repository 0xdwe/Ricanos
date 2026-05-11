import { describe, expect, it } from "vitest";
import { createEventAction, updateEventAction, transitionEventStatusAction } from "./event-actions";
import { createInMemoryEventStore } from "./in-memory-event-store";

describe("event actions", () => {
  it("creates an event with default courts and a public slug", async () => {
    const store = createInMemoryEventStore();
    const result = await createEventAction(store, {
      name: "Friday Americano",
      format: "americano",
      pairingMode: "individual",
      courtCount: 2,
      scoreTarget: 24,
      roundCount: 6,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.publicSlug).toMatch(/^friday-americano-/);
      expect(result.event.status).toBe("draft");
      expect(result.event.courts.map((court) => court.name)).toEqual(["Court 1", "Court 2"]);
    }
  });

  it("updates safe event metadata", async () => {
    const store = createInMemoryEventStore();
    const created = await createEventAction(store, {
      name: "Friday Americano",
      format: "americano",
      pairingMode: "individual",
      courtCount: 1,
      scoreTarget: 24,
      roundCount: 6,
    });
    if (!created.ok) throw new Error("expected create to pass");

    const updated = await updateEventAction(store, created.event.id, {
      name: "Saturday Americano",
      description: "Updated",
      eventDate: "2026-06-02",
      venueName: "Padel Club",
      venueAddress: "Street 1",
      autoRefreshSeconds: 60,
    });

    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.event.name).toBe("Saturday Americano");
      expect(updated.event.venueName).toBe("Padel Club");
    }
  });

  it("changes status only through allowed lifecycle transitions", async () => {
    const store = createInMemoryEventStore();
    const created = await createEventAction(store, {
      name: "Friday Americano",
      format: "americano",
      pairingMode: "individual",
      courtCount: 1,
      scoreTarget: 24,
      roundCount: 6,
    });
    if (!created.ok) throw new Error("expected create to pass");

    const ready = await transitionEventStatusAction(store, created.event.id, "ready");
    expect(ready.ok).toBe(true);

    const invalid = await transitionEventStatusAction(store, created.event.id, "completed");
    expect(invalid).toEqual({ ok: false, errors: [{ field: "status", message: "Cannot transition event from ready to completed" }] });
  });
});
