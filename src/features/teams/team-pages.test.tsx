import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FixedTeamRosterPage from "@/app/admin/events/[eventId]/teams/page";

describe("fixed-team admin pages", () => {
  it("renders fixed-team roster registration shell", async () => {
    const ui = await FixedTeamRosterPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Fixed-team roster" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
    expect(screen.getByLabelText("Paste fixed teams")).toBeInTheDocument();
  });
});
