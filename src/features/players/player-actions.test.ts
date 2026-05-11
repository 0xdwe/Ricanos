import { describe, expect, it } from "vitest";
import { addPlayerToRosterAction, createPlayerAction, importPlayersAction } from "./player-actions";
import { createInMemoryPlayerStore } from "./in-memory-player-store";

describe("player actions", () => {
  it("creates a reusable player", async () => {
    const store = createInMemoryPlayerStore();
    const result = await createPlayerAction(store, " Alice Tan ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.player.displayName).toBe("Alice Tan");
      expect(result.player.normalizedName).toBe("alice tan");
    }
  });

  it("reuses an existing player when importing duplicate names", async () => {
    const store = createInMemoryPlayerStore();
    await createPlayerAction(store, "Alice");

    const result = await importPlayersAction(store, "Alice\nBob\nalice");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.players.map((player) => player.displayName)).toEqual(["Alice", "Bob"]);
    }
  });

  it("adds a player to an event roster once", async () => {
    const store = createInMemoryPlayerStore();
    const created = await createPlayerAction(store, "Alice");
    if (!created.ok) throw new Error("expected player");

    const added = await addPlayerToRosterAction(store, "event_1", created.player.id);
    expect(added.ok).toBe(true);

    const duplicate = await addPlayerToRosterAction(store, "event_1", created.player.id);
    expect(duplicate).toEqual({ ok: false, errors: [{ field: "playerId", message: "Player is already on this event roster" }] });
  });
});
