import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TeamRoundRobinPreviewPage from "@/app/admin/events/[eventId]/schedule/round-robin/page";

describe("TeamRoundRobinPreviewPage", () => {
  it("renders fixed-team round-robin preview controls", async () => {
    const ui = await TeamRoundRobinPreviewPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Fixed-team round-robin preview" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
    expect(screen.getByText("Preview team schedule before saving")).toBeInTheDocument();
  });
});
