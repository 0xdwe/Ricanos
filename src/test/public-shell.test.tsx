import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PublicEventPage from "@/app/events/[slug]/page";

describe("PublicEventPage", () => {
  it("renders a view-only leaderboard-first event shell", async () => {
    const ui = await PublicEventPage({ params: Promise.resolve({ slug: "demo" }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    expect(screen.getByText("View-only public event")).toBeInTheDocument();
    expect(screen.getByText("Current and upcoming matches")).toBeInTheDocument();
  });
});
