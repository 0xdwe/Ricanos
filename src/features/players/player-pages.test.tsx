import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PlayerDirectoryPage from "@/app/admin/players/page";
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
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
  });
});
