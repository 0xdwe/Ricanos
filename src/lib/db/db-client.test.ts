import { describe, expect, it, vi } from "vitest";

vi.mock("postgres", () => ({
  default: vi.fn(() => ({ query: vi.fn() })),
}));

vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: vi.fn((client) => ({ client })),
}));

vi.mock("@/lib/env", () => ({
  readServerEnv: () => ({ DATABASE_URL: "postgres://user:pass@localhost:5432/ricanos" }),
}));

describe("createDb", () => {
  it("reuses a single postgres client for repeated store calls", async () => {
    vi.resetModules();
    const postgres = (await import("postgres")).default;
    const { createDb } = await import("./index");

    createDb();
    createDb();
    createDb();

    expect(postgres).toHaveBeenCalledTimes(1);
  });
});
