import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Draining database connection pool...`);
  pool.end().then(() => {
    console.log("Database pool closed.");
    process.exit(0);
  }).catch((err) => {
    console.error("Error closing database pool:", err);
    process.exit(1);
  });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
