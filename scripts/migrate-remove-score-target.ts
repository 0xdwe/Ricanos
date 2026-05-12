import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not set");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function migrate() {
  console.log("Applying migration: Remove score_target columns...");
  
  try {
    await db.execute(sql`ALTER TABLE events DROP COLUMN IF EXISTS score_target`);
    console.log("✓ Dropped score_target from events");
    
    await db.execute(sql`ALTER TABLE matches DROP COLUMN IF EXISTS score_target`);
    console.log("✓ Dropped score_target from matches");
    
    await db.execute(sql`ALTER TABLE matches DROP COLUMN IF EXISTS score_override_warning`);
    console.log("✓ Dropped score_override_warning from matches");
    
    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
