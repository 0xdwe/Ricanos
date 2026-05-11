import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readServerEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb(databaseUrl = readServerEnv().DATABASE_URL) {
  const client = postgres(databaseUrl, { prepare: false });
  return drizzle(client, { schema });
}
