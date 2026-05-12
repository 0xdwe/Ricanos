import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  createDb: () => ({}),
}));

vi.mock("@/features/events/event-read-model", () => ({
  loadEventReadModel: async () => ({
    event: { id: "event_1", name: "Friday Americano", pairingMode: "individual", format: "americano" },
    players: [{ id: "player_1", displayName: "Alice" }],
    roster: [{ eventId: "event_1", playerId: "player_1", sortOrder: 1 }],
    teams: [],
    matches: [],
    participants: [{ id: "player_1", displayName: "Alice" }],
    playerById: new Map([["player_1", { id: "player_1", displayName: "Alice" }]]),
    nameById: new Map([["player_1", "Alice"]]),
  }),
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
