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
  scoreTarget: 24,
  scoreOverrideWarning: null,
  abandonedCountsTowardLeaderboard: false,
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("match actions", () => {
  it("scores a match through the store seam", async () => {
    const store = createInMemoryMatchStore([match]);
    const result = await scoreMatchAction(store, "match_1", { teamOneScore: 15, teamTwoScore: 9, overrideConfirmed: false });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.match.status).toBe("completed");
    await expect(store.listMatches("event_1")).resolves.toMatchObject([{ id: "match_1", teamOneScore: 15, teamTwoScore: 9 }]);
  });

  it("blocks invalid scores until the admin confirms override", async () => {
    const store = createInMemoryMatchStore([match]);
    await expect(scoreMatchAction(store, "match_1", { teamOneScore: 15, teamTwoScore: 8, overrideConfirmed: false })).resolves.toEqual({
      ok: false,
      errors: [{ field: "score", message: "Score total 23 does not match target 24" }],
    });

    const result = await scoreMatchAction(store, "match_1", { teamOneScore: 15, teamTwoScore: 8, overrideConfirmed: true });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.match.scoreOverrideWarning).toBe("Score total 23 does not match target 24");
  });

  it("updates abandoned match count behavior through the store seam", async () => {
    const store = createInMemoryMatchStore([{ ...match, teamOneScore: 7, teamTwoScore: 5 }]);
    const result = await transitionMatchStatusAction(store, "match_1", "abandoned", { abandonedCountsTowardLeaderboard: false });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.match).toMatchObject({ status: "abandoned", abandonedCountsTowardLeaderboard: false });
  });

  it("records audit entries for score updates, overrides, and status changes when an audit store is provided", async () => {
    const store = createInMemoryMatchStore([match]);
    const auditStore = createInMemoryAuditLogStore();

    await scoreMatchAction(store, "match_1", { teamOneScore: 15, teamTwoScore: 8, overrideConfirmed: true }, { store: auditStore, actorId: "admin_1" });
    await transitionMatchStatusAction(store, "match_1", "in_progress", {}, { store: auditStore, actorId: "admin_1" });

    await expect(auditStore.listRecent("event_1", 10)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionType: "score_updated", actorId: "admin_1", entityId: "match_1" }),
        expect.objectContaining({ actionType: "risky_override_confirmed", summary: "Score total 23 does not match target 24" }),
        expect.objectContaining({ actionType: "match_status_updated", summary: "Match status updated from completed to in_progress" }),
      ]),
    );
  });

  it("returns readable errors when match is missing", async () => {
    const store = createInMemoryMatchStore([]);
    await expect(scoreMatchAction(store, "missing", { teamOneScore: 12, teamTwoScore: 12, overrideConfirmed: false })).resolves.toEqual({
      ok: false,
      errors: [{ field: "matchId", message: "Match not found" }],
    });
    await expect(transitionMatchStatusAction(store, "missing", "in_progress")).resolves.toEqual({
      ok: false,
      errors: [{ field: "matchId", message: "Match not found" }],
    });
  });
});
