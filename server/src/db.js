import { readFileSync } from "node:fs";
import pg from "pg";
import { DuplicateError } from "./errors.js";

/**
 * Talks directly to the Supabase Postgres database with a normal connection
 * string (no Supabase API keys). Every query is parameterised.
 *
 * Every database call the app makes lives here, behind a small interface:
 *   findAdminByUsername, upsertAdmin, insertRegistration, listRegistrations,
 *   countByStatus, updateRegistrationStatus
 * Handlers only talk to this interface, which keeps them easy to test.
 */

const toRegistration = (row) =>
  row && {
    id: row.id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    fullName: row.full_name,
    email: row.email,
    inGameName: row.in_game_name,
    discord: row.discord,
    platform: row.platform,
    experience: row.experience,
    playWith: row.play_with,
    notes: row.notes,
    status: row.status,
    adminNote: row.admin_note,
    reviewedAt: row.reviewed_at instanceof Date ? row.reviewed_at.toISOString() : row.reviewed_at,
    reviewedBy: row.reviewed_by,
  };

/**
 * Supabase requires SSL. If you download the project's CA certificate
 * (Dashboard -> Project Settings -> Database -> SSL) and set DATABASE_CA_CERT
 * to its path, the server's certificate is fully verified. Without it the
 * connection is still encrypted, but the certificate isn't checked.
 */
function sslOptions({ databaseUrl, databaseCaCert }) {
  if (/sslmode=disable/.test(databaseUrl) || /@(localhost|127\.0\.0\.1)[:/]/.test(databaseUrl)) return false;
  if (databaseCaCert) return { ca: readFileSync(databaseCaCert, "utf8"), rejectUnauthorized: true };
  return { rejectUnauthorized: false };
}

export function createPool(config) {
  // pg would otherwise let ?sslmode= in the URL override the ssl option below.
  const connectionString = config.databaseUrl.replace(/([?&])sslmode=[^&]*&?/, "$1").replace(/[?&]$/, "");
  const pool = new pg.Pool({
    connectionString,
    ssl: sslOptions(config),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on("error", (err) => console.error("Idle database connection error:", err.message));
  return pool;
}

export function createRepo(config) {
  const pool = createPool(config);

  const query = async (text, params, what) => {
    try {
      return await pool.query(text, params);
    } catch (error) {
      if (error.code === "23505") throw new DuplicateError("Duplicate");
      const err = new Error(`Database error while ${what}: ${error.message}`);
      err.cause = error;
      throw err;
    }
  };

  return {
    pool,

    async findAdminByUsername(username) {
      const { rows } = await query(
        "select id, username, password_hash from admins where username = $1",
        [username],
        "looking up admin"
      );
      const a = rows[0];
      return a ? { id: a.id, username: a.username, passwordHash: a.password_hash } : null;
    },

    async upsertAdmin(username, passwordHash) {
      await query(
        `insert into admins (username, password_hash) values ($1, $2)
         on conflict (username) do update set password_hash = excluded.password_hash`,
        [username, passwordHash],
        "saving admin"
      );
    },

    async insertRegistration(r) {
      const { rows } = await query(
        `insert into registrations
           (full_name, email, in_game_name, discord, platform, experience, play_with, notes)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning *`,
        [r.fullName, r.email, r.inGameName, r.discord, r.platform, r.experience, r.playWith, r.notes],
        "saving registration"
      );
      return toRegistration(rows[0]);
    },

    async listRegistrations({ status, search, limit, offset }) {
      const where = [];
      const params = [];
      if (status) {
        params.push(status);
        where.push(`status = $${params.length}`);
      }
      if (search) {
        // Escape LIKE wildcards so the search is literal.
        params.push(`%${search.replace(/[\\%_]/g, "\\$&")}%`);
        const p = `$${params.length}`;
        where.push(`(full_name ilike ${p} or email ilike ${p} or in_game_name ilike ${p} or discord ilike ${p})`);
      }
      const whereSql = where.length ? `where ${where.join(" and ")}` : "";
      params.push(limit, offset);
      const { rows } = await query(
        `select *, count(*) over () as total_count
           from registrations ${whereSql}
          order by created_at desc
          limit $${params.length - 1} offset $${params.length}`,
        params,
        "listing registrations"
      );
      let total = rows.length ? Number(rows[0].total_count) : 0;
      if (!rows.length && offset > 0) {
        // Asked for a page past the end: still report the real total.
        const c = await query(`select count(*)::int as n from registrations ${whereSql}`, params.slice(0, -2), "counting");
        total = c.rows[0].n;
      }
      return { rows: rows.map(toRegistration), total };
    },

    async countByStatus() {
      const { rows } = await query(
        `select
           count(*) filter (where status = 'pending')::int  as pending,
           count(*) filter (where status = 'accepted')::int as accepted,
           count(*) filter (where status = 'rejected')::int as rejected,
           count(*)::int as total
         from registrations`,
        [],
        "counting registrations"
      );
      return rows[0];
    },

    async updateRegistrationStatus(id, { status, adminNote, reviewedBy }) {
      const reviewed = status !== "pending";
      const params = [id, status, reviewed ? reviewedBy : null];
      let noteSql = "";
      if (adminNote !== undefined) {
        params.push(adminNote);
        noteSql = `, admin_note = $${params.length}`;
      }
      const { rows } = await query(
        `update registrations
            set status = $2,
                reviewed_by = $3,
                reviewed_at = ${reviewed ? "now()" : "null"}
                ${noteSql}
          where id = $1
          returning *`,
        params,
        "updating registration"
      );
      return toRegistration(rows[0]) ?? null;
    },

    close: () => pool.end(),
  };
}
