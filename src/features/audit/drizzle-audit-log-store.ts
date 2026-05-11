import { desc, eq } from "drizzle-orm";
import { createDb } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import type { AuditEntry, AuditLogStore, CreateAuditEntryInput } from "./audit-log";

type Db = ReturnType<typeof createDb>;

function mapAuditEntry(row: typeof auditLog.$inferSelect): AuditEntry {
  return {
    id: row.id,
    actionType: row.actionType,
    actorId: row.actorId,
    eventId: row.eventId,
    entityKind: row.entityKind,
    entityId: row.entityId,
    summary: row.summary,
    createdAt: row.createdAt,
  };
}

export function createDrizzleAuditLogStore(db: Db = createDb()): AuditLogStore {
  return {
    async record(input: CreateAuditEntryInput) {
      const [entry] = await db.insert(auditLog).values(input).returning();
      return mapAuditEntry(entry);
    },
    async listRecent(eventId: string, limit = 10) {
      const rows = await db.select().from(auditLog).where(eq(auditLog.eventId, eventId)).orderBy(desc(auditLog.createdAt)).limit(limit);
      return rows.map(mapAuditEntry);
    },
  };
}
