import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventStatusForm } from "./event-status-form";

describe("EventStatusForm", () => {
  it("offers a simple finish event action for live events", () => {
    render(<EventStatusForm eventId="event_1" status="live" />);

    expect(screen.getByText("Event status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finish event" })).toBeInTheDocument();
  });

  it("offers reopen for completed events", () => {
    render(<EventStatusForm eventId="event_1" status="completed" />);

    expect(screen.getByRole("button", { name: "Reopen event" })).toBeInTheDocument();
  });
});
