import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AvailabilityPage from "@/app/admin/events/[eventId]/availability/page";

describe("AvailabilityPage", () => {
  it("renders manual rest flag shell", async () => {
    const ui = await AvailabilityPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Round availability" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
    expect(screen.getByText("Mark players or teams as resting/unavailable before generating the next round.")).toBeInTheDocument();
  });
});
