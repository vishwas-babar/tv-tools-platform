import { Pool } from "pg";

export function createPgPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon resolves to both IPv4 and IPv6; IPv6 routes often time out locally.
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 30_000,
    max: 10,
    keepAlive: true,
  });

  pool.on("error", (err) => {
    console.error("[db-pool] idle client error:", err.message);
  });

  return pool;
}
