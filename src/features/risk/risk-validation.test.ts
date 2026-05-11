import { describe, expect, it } from "vitest";
import { validateRiskyAdminChanges, type RiskMatch } from "./risk-validation";

const baseMatch: RiskMatch = {
  id: "match_1",
  roundNumber: 1,
  courtNumber: 1,
  status: "scheduled",
  teamOneParticipantIds: ["p1", "p2"],
  teamTwoParticipantIds: ["p3", "p4"],
  scoreTarget: 24,
};

describe("risk validation", () => {
  it("requires confirmation for live match player assignment changes", () => {
    const result = validateRiskyAdminChanges({
      eventStatus: "live",
      originalMatches: [baseMatch],
      matches: [{ ...baseMatch, teamTwoParticipantIds: ["p3", "p5"] }],
    });

    expect(result.requiresConfirmation).toBe(true);
    expect(result.canSave).toBe(false);
    expect(result.warnings).toContainEqual(expect.objectContaining({ code: "live_match_player_change" }));
  });

  it("requires confirmation when live players swap teams", () => {
    const result = validateRiskyAdminChanges({
      eventStatus: "live",
      originalMatches: [baseMatch],
      matches: [{ ...baseMatch, teamOneParticipantIds: ["p1", "p3"], teamTwoParticipantIds: ["p2", "p4"] }],
    });

    expect(result.requiresConfirmation).toBe(true);
    expect(result.warnings).toContainEqual(expect.objectContaining({ code: "live_match_player_change" }));
  });

  it("warns about duplicate participants, wrong counts, court conflicts, fixed team violations, and score target mismatches", () => {
    const result = validateRiskyAdminChanges({
      pairingMode: "fixed_team",
      fixedTeams: [{ id: "team_1", playerIds: ["p1", "p2"] }, { id: "team_2", playerIds: ["p3", "p4"] }],
      matches: [
        { ...baseMatch, teamOneParticipantIds: ["p1", "p1"], teamTwoScore: 10, teamOneScore: 13 },
        { ...baseMatch, id: "match_2", courtNumber: 1, teamOneParticipantIds: ["p5"], teamTwoParticipantIds: ["p6", "p7"] },
      ],
    });

    expect(result.canSave).toBe(false);
    expect(result.warnings.map((warning) => warning.code)).toEqual(expect.arrayContaining(["duplicate_participant", "wrong_player_count", "court_conflict", "fixed_team_violation", "score_target_mismatch"]));
  });

  it("allows force-save when override is confirmed", () => {
    const result = validateRiskyAdminChanges({ matches: [{ ...baseMatch, teamOneParticipantIds: ["p1"] }], overrideConfirmed: true });

    expect(result.requiresConfirmation).toBe(true);
    expect(result.canSave).toBe(true);
  });
});
