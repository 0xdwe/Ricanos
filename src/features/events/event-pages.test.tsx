import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NewEventPage from "@/app/admin/events/new/page";

vi.mock("@/features/events/drizzle-event-store", () => ({
  createDrizzleEventStore: () => ({
    getEvent: async () => ({
      id: "event_1",
      name: "Friday Americano",
      publicSlug: "friday-americano",
      status: "draft",
      format: "americano",
      pairingMode: "individual",
      courtCount: 2,
      scoreTarget: 32,
      roundCount: 4,
    }),
  }),
}));

import EventDetailPage from "@/app/admin/events/[eventId]/page";

describe("admin event pages", () => {
  it("renders the create event form", () => {
    render(<NewEventPage />);
    expect(screen.getByRole("heading", { name: "Create event" })).toBeInTheDocument();
    expect(screen.getByLabelText("Event name")).toBeInTheDocument();
    expect(screen.getByLabelText("Format")).toBeInTheDocument();
    expect(screen.getByLabelText("Pairing mode")).toBeInTheDocument();
    expect(screen.queryByLabelText("Round count")).not.toBeInTheDocument();
  });

  it("renders event settings shell", async () => {
    const ui = await EventDetailPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Friday Americano" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Edit event" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete event" })).toBeInTheDocument();
  });
});
