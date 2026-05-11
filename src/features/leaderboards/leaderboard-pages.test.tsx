import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventLeaderboardPage from "@/app/admin/events/[eventId]/leaderboard/page";

describe("leaderboard pages", () => {
  it("renders admin leaderboard shell with transparent columns", async () => {
    const ui = await EventLeaderboardPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
    expect(screen.getByText("Avg points")).toBeInTheDocument();
    expect(screen.getByText("Played")).toBeInTheDocument();
  });
});
