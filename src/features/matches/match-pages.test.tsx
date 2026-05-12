import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EventScoresPage from "@/app/admin/events/[eventId]/scores/page";

vi.mock("@/lib/db", () => ({
  createDb: () => ({}),
}));

vi.mock("@/features/events/event-read-model", () => ({
  loadEventReadModel: async () => ({
    event: { id: "event_1", name: "Friday Americano", format: "americano", publicSlug: "friday-americano-abc" },
    players: [
      { id: "player_1", displayName: "Alice" },
      { id: "player_2", displayName: "Ben" },
      { id: "player_3", displayName: "Carla" },
      { id: "player_4", displayName: "Dion" },
    ],
    roster: [],
    teams: [],
    matches: [
      {
        id: "match_1",
        eventId: "event_1",
        roundNumber: 1,
        courtNumber: 1,
        status: "scheduled",
        teamOneParticipantIds: ["player_1", "player_2"],
        teamTwoParticipantIds: ["player_3", "player_4"],
        teamOneScore: null,
        teamTwoScore: null,
        scoreTarget: 32,
        scoreOverrideWarning: null,
        abandonedCountsTowardLeaderboard: false,
        updatedAt: new Date(),
      },
    ],
    participants: [],
    playerById: new Map(),
    nameById: new Map([
      ["player_1", "Alice"],
      ["player_2", "Ben"],
      ["player_3", "Carla"],
      ["player_4", "Dion"],
    ]),
  }),
}));

vi.mock("@/features/matches/drizzle-match-store", () => ({
  createDrizzleMatchStore: () => ({
    getMatch: async () => null,
  }),
}));

describe("score entry page", () => {
  it("renders each match as a simple score card instead of asking admins for a UUID", async () => {
    const ui = await EventScoresPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Today's matches" })).toBeInTheDocument();
    expect(screen.getByText("Friday Americano")).toBeInTheDocument();
    expect(screen.getByText("Round 1 • Court 1")).toBeInTheDocument();
    expect(screen.getByText("Alice + Ben")).toBeInTheDocument();
    expect(screen.getByText("Carla + Dion")).toBeInTheDocument();
    expect(screen.queryByLabelText("Match ID")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save score" })).toBeInTheDocument();
  });
});
