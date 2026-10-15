/**
 * Creates the tables in your Supabase database.
 *
 *   npm run db:setup
 *
 * Safe to run more than once: everything uses "if not exists".
 */
import { readFileSync } from "node:fs";
import { createPool } from "../src/db.js";
import { loadDbConfig } from "../src/config.js";

const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const pool = createPool(loadDbConfig());

try {
  await pool.query(sql);
  const { rows } = await pool.query(
    "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('registrations', 'admins') order by 1"
  );
  console.log(`Database ready. Tables: ${rows.map((r) => r.table_name).join(", ")}.`);
  console.log("Next: npm run create-admin -- <username>");
} catch (err) {
  console.error("Database setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
