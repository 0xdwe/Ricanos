import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NewEventPage from "@/app/admin/events/new/page";
import EventDetailPage from "@/app/admin/events/[eventId]/page";

describe("admin event pages", () => {
  it("renders the create event form", () => {
    render(<NewEventPage />);
    expect(screen.getByRole("heading", { name: "Create event" })).toBeInTheDocument();
    expect(screen.getByLabelText("Event name")).toBeInTheDocument();
    expect(screen.getByLabelText("Format")).toBeInTheDocument();
    expect(screen.getByLabelText("Pairing mode")).toBeInTheDocument();
  });

  it("renders event settings shell", async () => {
    const ui = await EventDetailPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Event settings" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
  });
});
