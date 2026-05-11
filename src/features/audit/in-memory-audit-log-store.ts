import type { AuditEntry, AuditLogStore, CreateAuditEntryInput } from "./audit-log";

let nextId = 1;

function id() {
  const value = `audit_${nextId}`;
  nextId += 1;
  return value;
}

export function createInMemoryAuditLogStore(initialEntries: AuditEntry[] = []): AuditLogStore {
  const entries = new Map(initialEntries.map((entry) => [entry.id, entry]));

  return {
    async record(input: CreateAuditEntryInput) {
      const entry: AuditEntry = {
        id: id(),
        ...input,
        actorId: input.actorId ?? null,
        createdAt: input.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
      };
      entries.set(entry.id, entry);
      return entry;
    },
    async listRecent(eventId: string, limit = 10) {
      return [...entries.values()]
        .filter((entry) => entry.eventId === eventId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    },
  };
}
