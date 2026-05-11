import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AmericanoSchedulePreviewPage from "@/app/admin/events/[eventId]/schedule/americano/page";

describe("AmericanoSchedulePreviewPage", () => {
  it("renders schedule preview controls", async () => {
    const ui = await AmericanoSchedulePreviewPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Americano schedule preview" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
    expect(screen.getByLabelText("Random seed")).toBeInTheDocument();
    expect(screen.getByText("Preview before saving"));
  });
});
