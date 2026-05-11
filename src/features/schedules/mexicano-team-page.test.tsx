import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MexicanoTeamPage from "@/app/admin/events/[eventId]/schedule/mexicano-teams/page";

describe("MexicanoTeamPage", () => {
  it("renders Mexicano fixed-team round generation shell", async () => {
    const ui = await MexicanoTeamPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Mexicano fixed-team round" })).toBeInTheDocument();
    expect(screen.getByText("Power-pair Team #1 vs #2, #3 vs #4"));
  });
});
