/**
 * Input validation for the public registration form and the admin API.
 * Returns { value } on success or { errors: { field: message } } on failure.
 */

export const PLATFORMS = ["pc", "mobile", "console"];
export const EXPERIENCE = ["new", "casual", "regular", "competitive"];
export const STATUSES = ["pending", "accepted", "rejected"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const clean = (v) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const optional = (v) => clean(v) || null;

export function validateRegistration(body = {}) {
  const errors = {};
  const value = {
    fullName: clean(body.fullName),
    email: clean(body.email).toLowerCase(),
    inGameName: clean(body.inGameName),
    discord: optional(body.discord),
    platform: clean(body.platform),
    experience: clean(body.experience),
    playWith: optional(body.playWith),
    notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null,
  };

  if (value.fullName.length < 2 || value.fullName.length > 80)
    errors.fullName = "Enter your name (2 to 80 characters).";
  if (!EMAIL.test(value.email) || value.email.length > 254)
    errors.email = "Enter a valid email address.";
  if (value.inGameName.length < 1 || value.inGameName.length > 10)
    errors.inGameName = "Among Us names are 1 to 10 characters.";
  if (value.discord && (value.discord.length < 2 || value.discord.length > 37))
    errors.discord = "Discord usernames are 2 to 37 characters.";
  if (!PLATFORMS.includes(value.platform)) errors.platform = "Choose the platform you'll play on.";
  if (!EXPERIENCE.includes(value.experience)) errors.experience = "Choose your experience level.";
  if (value.playWith && value.playWith.length > 120)
    errors.playWith = "Keep this under 120 characters.";
  if (value.notes && value.notes.length > 500) errors.notes = "Keep notes under 500 characters.";
  if (body.agreeRules !== true) errors.agreeRules = "Please agree to the lobby rules.";

  return Object.keys(errors).length ? { errors } : { value };
}

export function validateStatusUpdate(body = {}) {
  const errors = {};
  const status = clean(body.status);
  if (!STATUSES.includes(status)) errors.status = "Status must be pending, accepted or rejected.";

  let adminNote;
  if (body.adminNote !== undefined) {
    adminNote = typeof body.adminNote === "string" ? body.adminNote.trim() || null : null;
    if (adminNote && adminNote.length > 500) errors.adminNote = "Keep notes under 500 characters.";
  }
  return Object.keys(errors).length ? { errors } : { value: { status, adminNote } };
}

export function validateListQuery(query = {}) {
  const status = STATUSES.includes(query.status) ? query.status : null;
  const search = clean(query.q).slice(0, 80) || null;
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  return { status, search, limit, offset: (page - 1) * limit, page };
}

export const isUuid = (id) => typeof id === "string" && UUID.test(id);
