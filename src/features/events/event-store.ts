import type { EventFormat, EventStatus, PairingMode, ValidCreateEventInput } from "./event-model";

export type EventCourt = { id: string; eventId: string; name: string; sortOrder: number };

export type EventRecord = {
  id: string;
  name: string;
  description: string | null;
  publicSlug: string;
  status: EventStatus;
  format: EventFormat;
  pairingMode: PairingMode;
  eventDate: string | null;
  venueName: string | null;
  venueAddress: string | null;
  courtCount: number;
  scoreTarget: number;
  roundCount: number;
  autoRefreshSeconds: number | null;
  scheduleGenerated: boolean;
  courts: EventCourt[];
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateEventInput = Partial<Pick<ValidCreateEventInput, "name" | "description" | "eventDate" | "venueName" | "venueAddress" | "courtCount" | "scoreTarget" | "roundCount" | "autoRefreshSeconds">>;

export type EventStore = {
  createEvent(input: ValidCreateEventInput & { publicSlug: string }): Promise<EventRecord>;
  listEvents(): Promise<EventRecord[]>;
  getEvent(id: string): Promise<EventRecord | null>;
  getEventBySlug(slug: string): Promise<EventRecord | null>;
  updateEvent(id: string, input: UpdateEventInput): Promise<EventRecord | null>;
  updateStatus(id: string, status: EventStatus): Promise<EventRecord | null>;
};
