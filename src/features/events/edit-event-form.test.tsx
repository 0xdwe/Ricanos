import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditEventForm } from "./edit-event-form";

describe("EditEventForm", () => {
  const event: any = {
    id: "event_1",
    name: "Friday Americano",
    description: "Fun night",
    eventDate: "2026-05-12",
    venueName: "Ricanos",
    venueAddress: "Main street",
    courtCount: 2,
    scoreTarget: 24,
    roundCount: 6,
    autoRefreshSeconds: 30,
    scheduleGenerated: false,
  };

  it("renders editable event settings", () => {
    render(<EditEventForm event={event} />);

    expect(screen.getByRole("heading", { name: "Edit event" })).toBeInTheDocument();
    expect(screen.getByLabelText("Event name")).toHaveValue("Friday Americano");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("renders delete event action", () => {
    render(<EditEventForm event={event} />);

    expect(screen.getByRole("heading", { name: "Danger zone" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete event" })).toBeInTheDocument();
  });
});
