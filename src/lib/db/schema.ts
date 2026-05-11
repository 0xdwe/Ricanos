import { integer, pgEnum, pgTable, text, timestamp, uuid, date, boolean } from "drizzle-orm/pg-core";

export const eventStatus = pgEnum("event_status", ["draft", "ready", "live", "completed", "archived"]);
export const eventFormat = pgEnum("event_format", ["americano", "mexicano"]);
export const pairingMode = pgEnum("pairing_mode", ["individual", "fixed_team"]);

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  publicSlug: text("public_slug").notNull().unique(),
  status: eventStatus("status").notNull().default("draft"),
  format: eventFormat("format").notNull(),
  pairingMode: pairingMode("pairing_mode").notNull(),
  eventDate: date("event_date"),
  venueName: text("venue_name"),
  venueAddress: text("venue_address"),
  courtCount: integer("court_count").notNull(),
  scoreTarget: integer("score_target").notNull(),
  roundCount: integer("round_count").notNull(),
  autoRefreshSeconds: integer("auto_refresh_seconds"),
  scheduleGenerated: boolean("schedule_generated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courts = pgTable("courts", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  displayName: text("display_name").notNull(),
  normalizedName: text("normalized_name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const eventPlayers = pgTable("event_players", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamPlayers = pgTable("team_players", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  playerId: uuid("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
});
