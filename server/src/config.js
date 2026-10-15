import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Copy server/.env.example to server/.env and fill it in.`);
  }
  return value;
}

/** Just what's needed to reach the database (used by the setup scripts too). */
export function loadDbConfig() {
  const databaseUrl = required("DATABASE_URL");
  if (databaseUrl.includes("[YOUR-PASSWORD]")) {
    throw new Error("DATABASE_URL still contains [YOUR-PASSWORD]. Replace it with your database password.");
  }
  return {
    databaseUrl,
    databaseCaCert: process.env.DATABASE_CA_CERT
      ? resolve(process.cwd(), process.env.DATABASE_CA_CERT)
      : null,
  };
}

export function loadConfig() {
  const sessionSecret = required("SESSION_SECRET");
  if (sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }

  const defaultDist = resolve(here, "../../client/dist");
  const clientDist = process.env.CLIENT_DIST
    ? resolve(process.cwd(), process.env.CLIENT_DIST)
    : existsSync(defaultDist)
      ? defaultDist
      : null;

  return {
    ...loadDbConfig(),
    port: Number(process.env.PORT) || 4000,
    sessionSecret,
    sessionHours: Number(process.env.SESSION_HOURS) || 8,
    registrationOpen: process.env.REGISTRATION_OPEN !== "false",
    production: process.env.NODE_ENV === "production",
    trustProxy: Number(process.env.TRUST_PROXY) || 0,
    clientDist,
  };
}
