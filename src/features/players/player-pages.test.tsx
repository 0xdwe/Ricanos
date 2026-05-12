import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PlayerDirectoryPage from "@/app/admin/players/page";

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

import EventRosterPage from "@/app/admin/events/[eventId]/players/page";

describe("player admin pages", () => {
  it("explains that the player directory is automatic and points admins back to events", () => {
    render(<PlayerDirectoryPage />);
    expect(screen.getByRole("heading", { name: "Player directory" })).toBeInTheDocument();
    expect(screen.getByText(/You usually do not need this page during an event/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to events" })).toHaveAttribute("href", "/admin");
    expect(screen.queryByRole("button", { name: "Save players" })).not.toBeInTheDocument();
  });

  it("renders event roster shell", async () => {
    const ui = await EventRosterPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Event roster" })).toBeInTheDocument();
    expect(screen.getByText("Event: Friday Americano • 1 players registered")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
