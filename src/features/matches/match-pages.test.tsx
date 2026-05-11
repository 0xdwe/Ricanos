import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventScoresPage from "@/app/admin/events/[eventId]/scores/page";

describe("score entry page", () => {
  it("renders mobile-friendly admin score entry shell", async () => {
    const ui = await EventScoresPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Score entry" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
    expect(screen.getByLabelText("Team one score")).toBeInTheDocument();
    expect(screen.getByLabelText("Team two score")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Override target total after confirmation")).toBeInTheDocument();
  });
});
