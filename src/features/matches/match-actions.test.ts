import { describe, expect, it } from "vitest";
import { createInMemoryAuditLogStore } from "@/features/audit/in-memory-audit-log-store";
import { createInMemoryMatchStore } from "./in-memory-match-store";
import { scoreMatchAction, transitionMatchStatusAction } from "./match-actions";
import type { MatchRecord } from "./match-model";

const match: MatchRecord = {
  id: "match_1",
  eventId: "event_1",
  roundId: "round_1",
  roundNumber: 1,
  courtNumber: 1,
  status: "scheduled",
  teamOneParticipantIds: ["p1", "p2"],
  teamTwoParticipantIds: ["p3", "p4"],
  teamOneScore: null,
  teamTwoScore: null,
  abandonedCountsTowardLeaderboard: false,
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("match actions", () => {
  it("scores a match through the store seam", async () => {
    const store = createInMemoryMatchStore([match]);
    const result = await scoreMatchAction(store, "match_1", { teamOneScore: 15, teamTwoScore: 9 });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.match.status).toBe("completed");
    await expect(store.listMatches("event_1")).resolves.toMatchObject([{ id: "match_1", teamOneScore: 15, teamTwoScore: 9 }]);
  });

  it("accepts non-target scores without override", async () => {
    const store = createInMemoryMatchStore([match]);
    const result = await scoreMatchAction(store, "match_1", { teamOneScore: 15, teamTwoScore: 8 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.match).toMatchObject({ status: "completed", teamOneScore: 15, teamTwoScore: 8 });
  });

  it("updates abandoned match count behavior through the store seam", async () => {
    const store = createInMemoryMatchStore([{ ...match, teamOneScore: 7, teamTwoScore: 5 }]);
    const result = await transitionMatchStatusAction(store, "match_1", "abandoned", { abandonedCountsTowardLeaderboard: false });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.match).toMatchObject({ status: "abandoned", abandonedCountsTowardLeaderboard: false });
  });

  it("records audit entries for score updates and status changes when an audit store is provided", async () => {
    const store = createInMemoryMatchStore([match]);
    const auditStore = createInMemoryAuditLogStore();

    await scoreMatchAction(store, "match_1", { teamOneScore: 15, teamTwoScore: 8 }, { store: auditStore, actorId: "admin_1" });
    await transitionMatchStatusAction(store, "match_1", "in_progress", {}, { store: auditStore, actorId: "admin_1" });

    await expect(auditStore.listRecent("event_1", 10)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionType: "score_updated", actorId: "admin_1", entityId: "match_1" }),
        expect.objectContaining({ actionType: "match_status_updated", summary: "Match status updated from completed to in_progress" }),
      ]),
    );
  });

  it("returns readable errors when match is missing", async () => {
    const store = createInMemoryMatchStore([]);
    await expect(scoreMatchAction(store, "missing", { teamOneScore: 12, teamTwoScore: 12 })).resolves.toEqual({
      ok: false,
      errors: [{ field: "matchId", message: "Match not found" }],
    });
    await expect(transitionMatchStatusAction(store, "missing", "in_progress")).resolves.toEqual({
      ok: false,
      errors: [{ field: "matchId", message: "Match not found" }],
    });
  });
});
