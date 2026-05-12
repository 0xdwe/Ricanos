import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/events/drizzle-event-store", () => ({
  createDrizzleEventStore: () => ({
    getEvent: async () => ({ id: "event_1", name: "Friday Americano", pairingMode: "individual" }),
  }),
}));

vi.mock("@/features/players/drizzle-player-store", () => ({
  createDrizzlePlayerStore: () => ({
    listPlayers: async () => [{ id: "player_1", displayName: "Alice" }],
    listRoster: async () => [{ eventId: "event_1", playerId: "player_1", sortOrder: 1 }],
  }),
}));

vi.mock("@/features/teams/drizzle-team-store", () => ({
  createDrizzleTeamStore: () => ({ listTeams: async () => [] }),
}));

vi.mock("@/features/matches/drizzle-match-store", () => ({
  createDrizzleMatchStore: () => ({ listMatches: async () => [] }),
}));

import EventLeaderboardPage from "@/app/admin/events/[eventId]/leaderboard/page";

describe("leaderboard pages", () => {
  it("renders admin leaderboard shell with transparent columns", async () => {
    const ui = await EventLeaderboardPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    expect(screen.getByText("Event: Friday Americano")).toBeInTheDocument();
    expect(screen.getByText("Win / Loss")).toBeInTheDocument();
    expect(screen.getByText("Total points")).toBeInTheDocument();
    expect(screen.getByText("Played")).toBeInTheDocument();
  });
});
