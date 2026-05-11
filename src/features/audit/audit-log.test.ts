import { describe, expect, it } from "vitest";
import { createInMemoryAuditLogStore } from "./in-memory-audit-log-store";

const actions = [
  "score_updated",
  "match_status_updated",
  "match_players_swapped",
  "schedule_generated",
  "schedule_regenerated",
  "event_completed",
  "event_reopened",
  "risky_override_confirmed",
] as const;

describe("audit log store", () => {
  it("records supported admin actions with nullable actor and lists recent event activity", async () => {
    const store = createInMemoryAuditLogStore();

    for (const actionType of actions) {
      await store.record({
        actionType,
        actorId: null,
        eventId: "event_1",
        entityKind: actionType.startsWith("event_") ? "event" : "match",
        entityId: actionType,
        summary: `Recorded ${actionType}`,
      });
    }
    await store.record({ actionType: "score_updated", actorId: "admin_2", eventId: "event_2", entityKind: "match", entityId: "match_9", summary: "Other event" });

    const recent = await store.listRecent("event_1", 20);

    expect(recent).toHaveLength(actions.length);
    expect(recent.map((entry) => entry.actionType).sort()).toEqual([...actions].sort());
    expect(recent[0]).toMatchObject({ actorId: null, eventId: "event_1" });
  });
});
