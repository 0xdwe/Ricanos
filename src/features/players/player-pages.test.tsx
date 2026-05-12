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

import EventRosterPage from "@/app/admin/events/[eventId]/players/page";

describe("player admin pages", () => {
  it("renders reusable player directory shell", () => {
    render(<PlayerDirectoryPage />);
    expect(screen.getByRole("heading", { name: "Player directory" })).toBeInTheDocument();
    expect(screen.getByLabelText("Add player name")).toBeInTheDocument();
    expect(screen.getByLabelText("Paste player list")).toBeInTheDocument();
  });

  it("renders event roster shell", async () => {
    const ui = await EventRosterPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Event roster" })).toBeInTheDocument();
    expect(screen.getByText("Event: Friday Americano • 1 players registered")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
