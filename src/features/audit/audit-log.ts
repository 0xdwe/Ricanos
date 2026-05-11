export const auditActionTypes = [
  "score_updated",
  "match_status_updated",
  "match_players_swapped",
  "schedule_generated",
  "schedule_regenerated",
  "event_completed",
  "event_reopened",
  "risky_override_confirmed",
] as const;

export type AuditActionType = (typeof auditActionTypes)[number];
export type AuditEntityKind = "event" | "match" | "round" | "schedule";

export type AuditEntry = {
  id: string;
  actionType: AuditActionType;
  actorId: string | null;
  eventId: string;
  entityKind: AuditEntityKind;
  entityId: string;
  summary: string;
  createdAt: Date;
};

export type CreateAuditEntryInput = Omit<AuditEntry, "id" | "createdAt"> & { createdAt?: Date };

export type AuditLogStore = {
  record(input: CreateAuditEntryInput): Promise<AuditEntry>;
  listRecent(eventId: string, limit?: number): Promise<AuditEntry[]>;
};

export type AuditContext = {
  store?: AuditLogStore;
  actorId?: string | null;
};

export async function recordAuditEntry(store: AuditLogStore | undefined, input: CreateAuditEntryInput): Promise<AuditEntry | null> {
  if (!store) return null;
  return store.record(input);
}
