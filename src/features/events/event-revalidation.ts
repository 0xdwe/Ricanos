import { revalidatePath } from "next/cache";
import type { EventRecord } from "./event-store";

/**
 * Centralized event path revalidation.
 * Concentrates path knowledge in one module instead of duplicating across 40+ call sites.
 */

export type RevalidateEventOptions = {
  includeSchedule?: boolean;
  includeScores?: boolean;
  includeLeaderboard?: boolean;
  includeExports?: boolean;
  includeActivity?: boolean;
  includePublic?: boolean;
};

export function revalidateEventPaths(
  eventId: string,
  event?: Pick<EventRecord, "publicSlug"> | null,
  options: RevalidateEventOptions = {}
): void {
  const {
    includeSchedule = true,
    includeScores = true,
    includeLeaderboard = true,
    includeExports = true,
    includeActivity = true,
    includePublic = true,
  } = options;

  // Always revalidate event detail page
  revalidatePath(`/admin/events/${eventId}`);

  if (includeSchedule) {
    revalidatePath(`/admin/events/${eventId}/schedule/americano`);
    revalidatePath(`/admin/events/${eventId}/schedule/mexicano`);
    revalidatePath(`/admin/events/${eventId}/schedule/mexicano-teams`);
    revalidatePath(`/admin/events/${eventId}/schedule/round-robin`);
  }

  if (includeScores) {
    revalidatePath(`/admin/events/${eventId}/scores`);
  }

  if (includeLeaderboard) {
    revalidatePath(`/admin/events/${eventId}/leaderboard`);
  }

  if (includeExports) {
    revalidatePath(`/admin/events/${eventId}/exports`);
  }

  if (includeActivity) {
    revalidatePath(`/admin/events/${eventId}/activity`);
  }

  if (includePublic && event?.publicSlug) {
    revalidatePath(`/events/${event.publicSlug}`);
  }
}

/**
 * Revalidate only score-related paths (scores, leaderboard, public dashboard).
 * Use after match score updates.
 */
export function revalidateScorePaths(eventId: string, event?: Pick<EventRecord, "publicSlug"> | null): void {
  revalidateEventPaths(eventId, event, {
    includeSchedule: false,
    includeScores: true,
    includeLeaderboard: true,
    includeExports: false,
    includeActivity: false,
    includePublic: true,
  });
}

/**
 * Revalidate only schedule-related paths.
 * Use after schedule generation or match creation.
 */
export function revalidateSchedulePaths(eventId: string, event?: Pick<EventRecord, "publicSlug"> | null): void {
  revalidateEventPaths(eventId, event, {
    includeSchedule: true,
    includeScores: true,
    includeLeaderboard: false,
    includeExports: false,
    includeActivity: false,
    includePublic: true,
  });
}
