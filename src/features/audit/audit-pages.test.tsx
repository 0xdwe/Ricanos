import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventActivityPage from "@/app/admin/events/[eventId]/activity/page";

describe("recent activity page", () => {
  it("renders an admin audit activity shell", async () => {
    const ui = await EventActivityPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Recent activity" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Audit log" })).toBeInTheDocument();
    expect(screen.getByText("Risky override confirmed")).toBeInTheDocument();
  });
});
