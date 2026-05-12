import { boolean, date, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const eventStatus = pgEnum("event_status", ["draft", "ready", "live", "completed", "archived"]);
export const eventFormat = pgEnum("event_format", ["americano", "mexicano"]);
export const pairingMode = pgEnum("pairing_mode", ["individual", "fixed_team"]);
export const matchStatus = pgEnum("match_status", ["scheduled", "in_progress", "completed", "abandoned"]);
export const auditActionType = pgEnum("audit_action_type", [
  "score_updated",
  "match_status_updated",
  "match_players_swapped",
  "schedule_generated",
  "schedule_regenerated",
  "event_completed",
  "event_reopened",
  "risky_override_confirmed",
]);
export const auditEntityKind = pgEnum("audit_entity_kind", ["event", "match", "round", "schedule"]);

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

export const rounds = pgTable("rounds", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  roundNumber: integer("round_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matches = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  roundId: uuid("round_id").references(() => rounds.id, { onDelete: "set null" }),
  roundNumber: integer("round_number").notNull(),
  courtNumber: integer("court_number").notNull(),
  status: matchStatus("status").notNull().default("scheduled"),
  teamOneParticipantIds: jsonb("team_one_participant_ids").$type<string[]>().notNull(),
  teamTwoParticipantIds: jsonb("team_two_participant_ids").$type<string[]>().notNull(),
  teamOneScore: integer("team_one_score"),
  teamTwoScore: integer("team_two_score"),
  abandonedCountsTowardLeaderboard: boolean("abandoned_counts_toward_leaderboard").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actionType: auditActionType("action_type").notNull(),
  actorId: text("actor_id"),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  entityKind: auditEntityKind("entity_kind").notNull(),
  entityId: text("entity_id").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
