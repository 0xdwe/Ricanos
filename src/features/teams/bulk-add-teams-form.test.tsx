import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BulkAddTeamsForm } from "./bulk-add-teams-form";

describe("BulkAddTeamsForm", () => {
  it("lets admins paste fixed pairs for Mexicano", () => {
    render(<BulkAddTeamsForm eventId="event_1" />);

    expect(screen.getByLabelText("Paste player pairs")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Alice \/ Bob/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add pairs" })).toBeInTheDocument();
  });
});
