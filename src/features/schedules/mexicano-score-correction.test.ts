import { describe, expect, it } from "vitest";
import { createInMemoryAuditLogStore } from "@/features/audit/in-memory-audit-log-store";
import { createInMemoryMatchStore } from "@/features/matches/in-memory-match-store";
import { correctMexicanoPastScoreAction } from "@/features/matches/match-actions";
import type { MatchRecord } from "@/features/matches/match-model";
import { planMexicanoScoreCorrection } from "./mexicano-score-correction";

const baseMatch: MatchRecord = {
  id: "match_1",
  eventId: "event_1",
  roundId: "round_1",
  roundNumber: 1,
  courtNumber: 1,
  status: "completed",
  teamOneParticipantIds: ["p1", "p2"],
  teamTwoParticipantIds: ["p3", "p4"],
  teamOneScore: 12,
  teamTwoScore: 12,
  scoreTarget: 24,
  scoreOverrideWarning: null,
  abandonedCountsTowardLeaderboard: false,
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function match(overrides: Partial<MatchRecord>): MatchRecord {
  return { ...baseMatch, ...overrides };
}

describe("Mexicano score correction planning", () => {
  it("does not require a regeneration choice when there are no future rounds", () => {
    const plan = planMexicanoScoreCorrection({ editedRoundNumber: 2, matches: [match({ roundNumber: 1 }), match({ id: "match_2", roundNumber: 2 })] });

    expect(plan.requiresChoice).toBe(false);
    expect(plan.availableChoices).toEqual(["update_score_only"]);
    expect(plan.safeToRegenerateMatchIds).toEqual([]);
  });

  it("requires a preserve-or-regenerate choice when later rounds already exist", () => {
    const plan = planMexicanoScoreCorrection({ editedRoundNumber: 1, matches: [baseMatch, match({ id: "match_2", roundNumber: 2, status: "scheduled", teamOneScore: null, teamTwoScore: null })] });

    expect(plan.requiresChoice).toBe(true);
    expect(plan.availableChoices).toEqual(["update_score_only", "update_score_and_regenerate_unplayed_future_rounds"]);
    expect(plan.futureRoundNumbers).toEqual([2]);
  });

  it("protects completed, in-progress, and abandoned future matches from regeneration", () => {
    const plan = planMexicanoScoreCorrection({
      editedRoundNumber: 1,
      matches: [
        baseMatch,
        match({ id: "safe", roundNumber: 2, status: "scheduled", teamOneScore: null, teamTwoScore: null }),
        match({ id: "completed", roundNumber: 2, status: "completed", teamOneScore: 20, teamTwoScore: 4 }),
        match({ id: "in_progress", roundNumber: 3, status: "in_progress", teamOneScore: null, teamTwoScore: null }),
        match({ id: "abandoned", roundNumber: 3, status: "abandoned", teamOneScore: null, teamTwoScore: null }),
        match({ id: "scheduled_with_score", roundNumber: 4, status: "scheduled", teamOneScore: 1, teamTwoScore: null }),
      ],
    });

    expect(plan.safeToRegenerateMatchIds).toEqual(["safe"]);
    expect(plan.protectedMatchIds).toEqual(expect.arrayContaining(["completed", "in_progress", "abandoned", "scheduled_with_score"]));
    expect(plan.protectedMatchIds).toHaveLength(4);
  });

  it("requires an explicit correction choice before updating a past score with generated future rounds", async () => {
    const store = createInMemoryMatchStore([baseMatch, match({ id: "future", roundNumber: 2, status: "scheduled", teamOneScore: null, teamTwoScore: null })]);

    await expect(correctMexicanoPastScoreAction(store, "match_1", { teamOneScore: 18, teamTwoScore: 6, overrideConfirmed: false })).resolves.toEqual({
      ok: false,
      errors: [{ field: "correctionChoice", message: "Choose whether to preserve later rounds or regenerate only unplayed future rounds" }],
      correctionPlan: expect.objectContaining({ requiresChoice: true, safeToRegenerateMatchIds: ["future"] }),
    });
  });

  it("updates only the score and preserves future matches when admin chooses update-score-only", async () => {
    const store = createInMemoryMatchStore([baseMatch, match({ id: "future", roundNumber: 2, status: "scheduled", teamOneScore: null, teamTwoScore: null })]);
    const result = await correctMexicanoPastScoreAction(store, "match_1", { teamOneScore: 18, teamTwoScore: 6, overrideConfirmed: false, correctionChoice: "update_score_only" });

    expect(result.ok).toBe(true);
    await expect(store.listMatches("event_1")).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: "future", status: "scheduled", teamOneScore: null, teamTwoScore: null })]));
  });

  it("returns only safe future match ids and records regeneration audit when requested", async () => {
    const store = createInMemoryMatchStore([
      baseMatch,
      match({ id: "safe", roundNumber: 2, status: "scheduled", teamOneScore: null, teamTwoScore: null }),
      match({ id: "protected", roundNumber: 2, status: "in_progress", teamOneScore: null, teamTwoScore: null }),
    ]);
    const auditStore = createInMemoryAuditLogStore();

    const result = await correctMexicanoPastScoreAction(store, "match_1", { teamOneScore: 18, teamTwoScore: 6, overrideConfirmed: false, correctionChoice: "update_score_and_regenerate_unplayed_future_rounds" }, { store: auditStore, actorId: "admin_1" });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.correctionPlan.safeToRegenerateMatchIds).toEqual(["safe"]);
    await expect(auditStore.listRecent("event_1", 10)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionType: "score_updated", entityId: "match_1" }),
        expect.objectContaining({ actionType: "schedule_regenerated", entityKind: "schedule", summary: "Marked 1 unplayed future match for regeneration after round 1 score correction" }),
      ]),
    );
  });
});
