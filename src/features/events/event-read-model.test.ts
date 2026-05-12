import { describe, expect, it } from "vitest";
import { createInMemoryEventStore } from "./in-memory-event-store";
import { createInMemoryPlayerStore } from "@/features/players/in-memory-player-store";
import { createInMemoryTeamStore } from "@/features/teams/in-memory-team-store";
import { createInMemoryMatchStore } from "@/features/matches/in-memory-match-store";
import { loadEventReadModel } from "./event-read-model";
import { vi } from "vitest";

vi.mock("@/lib/db", () => ({
  createDb: () => ({}),
}));

vi.mock("./drizzle-event-store", () => ({
  createDrizzleEventStore: () => eventStore,
}));

vi.mock("@/features/players/drizzle-player-store", () => ({
  createDrizzlePlayerStore: () => playerStore,
}));

vi.mock("@/features/teams/drizzle-team-store", () => ({
  createDrizzleTeamStore: () => teamStore,
}));

vi.mock("@/features/matches/drizzle-match-store", () => ({
  createDrizzleMatchStore: () => matchStore,
}));

const eventStore = createInMemoryEventStore();
const playerStore = createInMemoryPlayerStore();
const teamStore = createInMemoryTeamStore();
const matchStore = createInMemoryMatchStore();

describe("loadEventReadModel", () => {
  it("returns null when event not found", async () => {
    const result = await loadEventReadModel("missing");
    expect(result).toBeNull();
  });

  it("loads event with individual pairing mode and builds participant list from roster", async () => {
    const event = await eventStore.createEvent({
      name: "Test Event",
      description: null,
      eventDate: null,
      venueName: null,
      venueAddress: null,
      format: "americano",
      pairingMode: "individual",
      courtCount: 2,
      roundCount: 6,
      autoRefreshSeconds: null,
      publicSlug: "test-event-abc",
    });

    const alice = await playerStore.createPlayer({ displayName: "Alice", normalizedName: "alice" });
    const bob = await playerStore.createPlayer({ displayName: "Bob", normalizedName: "bob" });
    await playerStore.addPlayerToRoster(event.id, alice.id);
    await playerStore.addPlayerToRoster(event.id, bob.id);

    const match = await matchStore.createMatch({
      eventId: event.id,
      roundId: null,
      roundNumber: 1,
      courtNumber: 1,
      teamOneParticipantIds: [alice.id],
      teamTwoParticipantIds: [bob.id],
    });

    const result = await loadEventReadModel(event.id);

    expect(result).not.toBeNull();
    expect(result!.event.id).toBe(event.id);
    expect(result!.players).toHaveLength(2);
    expect(result!.roster).toHaveLength(2);
    expect(result!.teams).toHaveLength(0);
    expect(result!.matches).toHaveLength(1);
    expect(result!.participants).toEqual([
      { id: alice.id, displayName: "Alice" },
      { id: bob.id, displayName: "Bob" },
    ]);
    expect(result!.playerById.get(alice.id)?.displayName).toBe("Alice");
    expect(result!.nameById.get(bob.id)).toBe("Bob");
  });

  it("loads event with fixed_team pairing mode and builds participant list from teams", async () => {
    const event = await eventStore.createEvent({
      name: "Test Event",
      description: null,
      eventDate: null,
      venueName: null,
      venueAddress: null,
      format: "americano",
      pairingMode: "fixed_team",
      courtCount: 2,
      roundCount: 6,
      autoRefreshSeconds: null,
      publicSlug: "test-event-abc",
    });

    const alice = await playerStore.createPlayer({ displayName: "Alice", normalizedName: "alice" });
    const bob = await playerStore.createPlayer({ displayName: "Bob", normalizedName: "bob" });
    const teamA = await teamStore.createTeam({ eventId: event.id, displayName: "Team A", playerIds: [alice.id, bob.id] });

    const result = await loadEventReadModel(event.id);

    expect(result).not.toBeNull();
    expect(result!.participants).toEqual([{ id: teamA.id, displayName: "Team A" }]);
    expect(result!.teams).toHaveLength(1);
  });

  it("filters out roster entries for missing players", async () => {
    const event = await eventStore.createEvent({
      name: "Test Event",
      description: null,
      eventDate: null,
      venueName: null,
      venueAddress: null,
      format: "americano",
      pairingMode: "individual",
      courtCount: 2,
      roundCount: 6,
      autoRefreshSeconds: null,
      publicSlug: "test-event-abc",
    });

    const alice = await playerStore.createPlayer({ displayName: "Alice", normalizedName: "alice" });
    await playerStore.addPlayerToRoster(event.id, alice.id);
    await playerStore.addPlayerToRoster(event.id, "missing-player-id");

    const result = await loadEventReadModel(event.id);

    expect(result).not.toBeNull();
    expect(result!.participants).toEqual([{ id: alice.id, displayName: "Alice" }]);
  });
});
