import { defineConfig } from "drizzle-kit";
import { readServerEnv } from "./src/lib/env";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: readServerEnv().DATABASE_URL,
  },
});
