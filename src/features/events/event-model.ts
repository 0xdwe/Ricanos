export type EventFormat = "americano" | "mexicano";
export type PairingMode = "individual" | "fixed_team";
export type EventStatus = "draft" | "ready" | "live" | "completed" | "archived";

export type CreateEventInput = {
  name?: unknown;
  description?: unknown;
  eventDate?: unknown;
  venueName?: unknown;
  venueAddress?: unknown;
  format?: unknown;
  pairingMode?: unknown;
  courtCount?: unknown;
  roundCount?: unknown;
  autoRefreshSeconds?: unknown;
};

export type ValidCreateEventInput = {
  name: string;
  description: string | null;
  eventDate: string | null;
  venueName: string | null;
  venueAddress: string | null;
  format: EventFormat;
  pairingMode: PairingMode;
  courtCount: number;
  roundCount: number;
  autoRefreshSeconds: number | null;
};

export type FieldError = { field: string; message: string };
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: FieldError[] };

const formats: EventFormat[] = ["americano", "mexicano"];
const pairingModes: PairingMode[] = ["individual", "fixed_team"];

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function positiveInteger(value: unknown): number | null {
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(numberValue) || Number(numberValue) < 1) return null;
  return Number(numberValue);
}

export function validateCreateEventInput(input: CreateEventInput): ValidationResult<ValidCreateEventInput> {
  const errors: FieldError[] = [];
  const name = requiredString(input.name);
  const courtCount = positiveInteger(input.courtCount);
  const roundCount = positiveInteger(input.roundCount);
  const autoRefreshSeconds = input.autoRefreshSeconds === "" || input.autoRefreshSeconds == null ? null : positiveInteger(input.autoRefreshSeconds);

  if (!name) errors.push({ field: "name", message: "Event name is required" });
  if (!formats.includes(input.format as EventFormat)) errors.push({ field: "format", message: "Format must be Americano or Mexicano" });
  if (!pairingModes.includes(input.pairingMode as PairingMode)) errors.push({ field: "pairingMode", message: "Pairing mode must be individual or fixed-team" });
  if (!courtCount) errors.push({ field: "courtCount", message: "Court count must be at least 1" });
  if (!roundCount) errors.push({ field: "roundCount", message: "Round count must be at least 1" });
  if (input.autoRefreshSeconds !== undefined && input.autoRefreshSeconds !== null && input.autoRefreshSeconds !== "" && !autoRefreshSeconds) {
    errors.push({ field: "autoRefreshSeconds", message: "Auto-refresh seconds must be at least 1" });
  }

  if (errors.length > 0 || !name || !courtCount || !roundCount) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      description: optionalString(input.description),
      eventDate: optionalString(input.eventDate),
      venueName: optionalString(input.venueName),
      venueAddress: optionalString(input.venueAddress),
      format: input.format as EventFormat,
      pairingMode: input.pairingMode as PairingMode,
      courtCount,
      roundCount,
      autoRefreshSeconds,
    },
  };
}

export function createPublicSlug(name: string, seed: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "event"}-${seed}`;
}

export function getNextEventStatuses(status: EventStatus): EventStatus[] {
  switch (status) {
    case "draft":
      return ["ready", "archived"];
    case "ready":
      return ["live", "draft", "archived"];
    case "live":
      return ["completed"];
    case "completed":
      return ["live", "archived"];
    case "archived":
      return ["draft"];
  }
}

export function getEditableEventFields({ scheduleGenerated }: { status: EventStatus; scheduleGenerated: boolean }) {
  const safe = ["name", "description", "eventDate", "venueName", "venueAddress", "autoRefreshSeconds"];
  if (!scheduleGenerated) {
    return { safe, risky: ["courtCount", "roundCount"], locked: [] };
  }
  return { safe, risky: ["courtCount", "roundCount"], locked: ["format", "pairingMode"] };
}
