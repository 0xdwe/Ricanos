import { csvResponse } from "@/features/exports/csv-export";
import { isExportKind } from "@/features/exports/event-export";
import { loadEventCsvExport } from "@/features/exports/event-export-loader";

type ExportRouteContext = { params: Promise<{ eventId: string; kind: string }> };

export async function GET(_request: Request, context: ExportRouteContext): Promise<Response> {
  const { eventId, kind } = await context.params;
  if (!isExportKind(kind)) return new Response("Unknown export type", { status: 404 });

  const output = await loadEventCsvExport(eventId, kind);
  if (!output) return new Response("Event not found", { status: 404 });

  return csvResponse(output.csv, output.filename);
}
