import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MexicanoIndividualPage from "@/app/admin/events/[eventId]/schedule/mexicano/page";

describe("MexicanoIndividualPage", () => {
  it("renders Mexicano round generation shell", async () => {
    const ui = await MexicanoIndividualPage({ params: Promise.resolve({ eventId: "event_1" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: "Mexicano individual round" })).toBeInTheDocument();
    expect(screen.getByText("Power-pair #1 + #4 vs #2 + #3"));
  });
});
