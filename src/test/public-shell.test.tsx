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
    expect(screen.getByText("Public slug: demo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Refresh" })).toHaveClass("min-h-10");
    expect(screen.getByRole("link", { name: "Refresh scores" })).toHaveClass("flex");
  });

  it("accepts repeated player search params without crashing", async () => {
    const ui = await PublicEventPage({ params: Promise.resolve({ slug: "demo" }), searchParams: Promise.resolve({ player: ["Ana", "Bo"] }) });
    render(ui);

    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
  });
});
