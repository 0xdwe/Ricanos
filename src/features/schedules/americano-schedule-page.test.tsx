import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/events/drizzle-event-store", () => ({
  createDrizzleEventStore: () => ({
    getEvent: async () => ({
      id: "event_1",
      name: "Friday Americano",
      format: "americano",
      pairingMode: "individual",
      scheduleGenerated: false,
    }),
  }),
}));

vi.mock("@/features/players/drizzle-player-store", () => ({
  createDrizzlePlayerStore: () => ({ listRoster: async () => [] }),
}));

vi.mock("@/features/matches/drizzle-match-store", () => ({
  createDrizzleMatchStore: () => ({ listMatches: async () => [] }),
}));

import AmericanoSchedulePreviewPage from "@/app/admin/events/[eventId]/schedule/americano/page";

describe("AmericanoSchedulePreviewPage", () => {
  it("renders schedule preview controls", async () => {
    const ui = await AmericanoSchedulePreviewPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Americano schedule" })).toBeInTheDocument();
    expect(screen.getByText("Event: Friday Americano")).toBeInTheDocument();
    expect(screen.getByLabelText("Random seed")).toBeInTheDocument();
    expect(screen.getByText("1. Generate Preview")).toBeInTheDocument();
  });
});
