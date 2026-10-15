import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "zt_admin";

export function createAuth({ sessionSecret, sessionHours, production }) {
  const maxAgeMs = sessionHours * 60 * 60 * 1000;

  const cookieOptions = {
    httpOnly: true, // not readable from JavaScript
    secure: production, // HTTPS-only in production
    sameSite: "strict", // never sent on cross-site requests (CSRF protection)
    path: "/api",
  };

  return {
    issue(res, admin) {
      const token = jwt.sign({ sub: admin.id, username: admin.username }, sessionSecret, {
        algorithm: "HS256",
        expiresIn: `${sessionHours}h`,
      });
      res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: maxAgeMs });
    },

    clear(res) {
      res.clearCookie(SESSION_COOKIE, cookieOptions);
    },

    /** Middleware: rejects the request unless it carries a valid admin session. */
    requireAdmin(req, res, next) {
      const token = req.cookies?.[SESSION_COOKIE];
      if (!token) return res.status(401).json({ error: "Not logged in." });
      try {
        const payload = jwt.verify(token, sessionSecret, { algorithms: ["HS256"] });
        req.admin = { id: payload.sub, username: payload.username };
        next();
      } catch {
        res.status(401).json({ error: "Your session has expired. Log in again." });
      }
    },
  };
}
