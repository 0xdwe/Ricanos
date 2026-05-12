import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EventScoresPage from "@/app/admin/events/[eventId]/scores/page";

describe("score entry page", () => {
  it("renders mobile-friendly admin score entry form", async () => {
    const ui = await EventScoresPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Score entry" })).toBeInTheDocument();
    expect(screen.getByText("Event ID: event_1")).toBeInTheDocument();
    expect(screen.getByLabelText("Match ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Team one score")).toBeInTheDocument();
    expect(screen.getByLabelText("Team two score")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Override target total after confirmation")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Mexicano score correction" })).not.toBeInTheDocument();
    const saveButton = screen.getByRole("button", { name: "Save match update" });
    expect(saveButton).toHaveAttribute("type", "submit");
    expect(saveButton.closest("div")).toHaveClass("fixed");
    expect(saveButton).toHaveClass("min-h-14");
  });
});
