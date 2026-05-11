import { describe, expect, it } from "vitest";
import { readServerEnv } from "@/lib/env";

describe("readServerEnv", () => {
  it("returns configured values", () => {
    const env = readServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      DATABASE_URL: "postgres://user:pass@localhost:5432/ricanos",
    });

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key");
    expect(env.DATABASE_URL).toBe("postgres://user:pass@localhost:5432/ricanos");
  });

  it("throws a readable error when a required value is missing", () => {
    expect(() => readServerEnv({})).toThrow("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});
