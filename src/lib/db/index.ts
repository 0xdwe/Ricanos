import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readServerEnv } from "@/lib/env";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const cachedClients = new Map<string, Db>();

export function createDb(databaseUrl = readServerEnv().DATABASE_URL) {
  const cached = cachedClients.get(databaseUrl);
  if (cached) return cached;

  const client = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
  const db = drizzle(client, { schema });
  cachedClients.set(databaseUrl, db);
  return db;
}
