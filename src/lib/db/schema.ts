import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const eventStatus = pgEnum("event_status", ["draft", "ready", "live", "completed", "archived"]);
export const eventFormat = pgEnum("event_format", ["americano", "mexicano"]);
export const pairingMode = pgEnum("pairing_mode", ["individual", "fixed_team"]);

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  publicSlug: text("public_slug").notNull().unique(),
  status: eventStatus("status").notNull().default("draft"),
  format: eventFormat("format").notNull(),
  pairingMode: pairingMode("pairing_mode").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
