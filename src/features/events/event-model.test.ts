import { describe, expect, it } from "vitest";
import {
  createPublicSlug,
  getEditableEventFields,
  getNextEventStatuses,
  validateCreateEventInput,
} from "./event-model";

describe("event-model", () => {
  it("validates a complete create event input", () => {
    const result = validateCreateEventInput({
      name: "Friday Americano",
      description: "Community night",
      eventDate: "2026-06-01",
      venueName: "Padel Club",
      venueAddress: "Court Street 1",
      format: "americano",
      pairingMode: "individual",
      courtCount: 3,
      roundCount: 6,
      autoRefreshSeconds: 60,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Friday Americano");
      expect(result.value.courtCount).toBe(3);
    }
  });

  it("rejects invalid create event input with readable field errors", () => {
    const result = validateCreateEventInput({
      name: "",
      format: "tennis",
      pairingMode: "mixed",
      courtCount: 0,
      roundCount: 0,
      autoRefreshSeconds: -1,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({ field: "name", message: "Event name is required" });
      expect(result.errors).toContainEqual({ field: "format", message: "Format must be Americano or Mexicano" });
      expect(result.errors).toContainEqual({ field: "pairingMode", message: "Pairing mode must be individual or fixed-team" });
      expect(result.errors).toContainEqual({ field: "courtCount", message: "Court count must be at least 1" });
      expect(result.errors).toContainEqual({ field: "roundCount", message: "Round count must be at least 1" });
    }
  });

  it("creates stable unguessable-looking slugs from names and a seed", () => {
    expect(createPublicSlug("Friday Americano", "abc12345")).toBe("friday-americano-abc12345");
    expect(createPublicSlug("  MEXICANO!!! Night  ", "seed9999")).toBe("mexicano-night-seed9999");
  });

  it("defines lifecycle transitions", () => {
    expect(getNextEventStatuses("draft")).toEqual(["ready", "archived"]);
    expect(getNextEventStatuses("ready")).toEqual(["live", "draft", "archived"]);
    expect(getNextEventStatuses("live")).toEqual(["completed"]);
    expect(getNextEventStatuses("completed")).toEqual(["live", "archived"]);
    expect(getNextEventStatuses("archived")).toEqual(["draft"]);
  });

  it("classifies safe, risky, and locked fields", () => {
    expect(getEditableEventFields({ status: "live", scheduleGenerated: true })).toEqual({
      safe: ["name", "description", "eventDate", "venueName", "venueAddress", "autoRefreshSeconds"],
      risky: ["courtCount", "roundCount"],
      locked: ["format", "pairingMode"],
    });
  });
});
