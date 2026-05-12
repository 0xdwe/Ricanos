import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventExportsPage from "@/app/admin/events/[eventId]/exports/page";

describe("event export page", () => {
  it("renders CSV export links for leaderboard, matches, scores, and metadata", async () => {
    const ui = await EventExportsPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "CSV exports" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download leaderboard CSV" })).toHaveAttribute("href", "/admin/events/event_1/exports/leaderboard");
    expect(screen.getByRole("link", { name: "Download matches CSV" })).toHaveAttribute("href", "/admin/events/event_1/exports/matches");
    expect(screen.getByRole("link", { name: "Download scores CSV" })).toHaveAttribute("href", "/admin/events/event_1/exports/scores");
    expect(screen.getByRole("link", { name: "Download event metadata CSV" })).toHaveAttribute("href", "/admin/events/event_1/exports/event");
  });
});
