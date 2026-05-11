CREATE TYPE "public"."audit_action_type" AS ENUM('score_updated', 'match_status_updated', 'match_players_swapped', 'schedule_generated', 'schedule_regenerated', 'event_completed', 'event_reopened', 'risky_override_confirmed');--> statement-breakpoint
CREATE TYPE "public"."audit_entity_kind" AS ENUM('event', 'match', 'round', 'schedule');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_type" "audit_action_type" NOT NULL,
	"actor_id" text,
	"event_id" uuid NOT NULL,
	"entity_kind" "audit_entity_kind" NOT NULL,
	"entity_id" text NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;