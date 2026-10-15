/**
 * Thin fetch wrapper for the Express API. In development Vite proxies /api to
 * the server (see vite.config.js); in production the server serves this app,
 * so requests stay same-origin and the admin session cookie just works.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, fields = null } = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      signal,
      credentials: "same-origin",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("Can't reach the server. Check your connection and try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status}).`, {
      status: res.status,
      fields: data?.fields ?? null,
    });
  }
  return data;
}
