import { join } from "node:path";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createAuth } from "./auth.js";
import { makeAdminHandlers } from "./handlers/admin.js";
import { makeRegistrationHandlers } from "./handlers/registrations.js";

/** Mutating requests must be JSON. Together with SameSite=strict cookies this blocks CSRF. */
function requireJson(req, res, next) {
  if (!req.is("application/json")) {
    return res.status(415).json({ error: "Send the request as JSON." });
  }
  next();
}

export function createApp({ config, repo }) {
  const app = express();
  const auth = createAuth(config);

  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use(helmet());
  app.use(express.json({ limit: "20kb" }));
  app.use(cookieParser());

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many registrations from this connection. Try again later." },
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { error: "Too many login attempts. Wait 15 minutes and try again." },
  });

  const registrations = makeRegistrationHandlers({ repo, config });
  const admin = makeAdminHandlers({
    repo,
    auth,
    comparePassword: (plain, hash) => bcrypt.compare(plain, hash),
    dummyHash: bcrypt.hashSync(`unused-${Math.random()}`, 12),
  });

  // ---- Public API ----
  const api = express.Router();
  api.get("/health", (req, res) => res.json({ ok: true }));
  api.get("/registrations/status", registrations.status);
  api.post("/registrations", registerLimiter, requireJson, registrations.create);

  // ---- Admin API ----
  api.post("/admin/login", loginLimiter, requireJson, admin.login);
  api.post("/admin/logout", admin.logout);
  api.get("/admin/me", auth.requireAdmin, admin.me);
  api.get("/admin/registrations", auth.requireAdmin, admin.list);
  api.patch("/admin/registrations/:id", auth.requireAdmin, requireJson, admin.updateStatus);

  api.use((req, res) => res.status(404).json({ error: "Not found." }));
  app.use("/api", api);

  // ---- Built client (optional, for same-origin deployment) ----
  if (config.clientDist) {
    app.use(express.static(config.clientDist, { index: false, maxAge: "1h" }));
    // Client-side routes (/, /register, /admin) all load index.html.
    app.use((req, res, next) => {
      if (req.method !== "GET") return next();
      res.sendFile(join(config.clientDist, "index.html"));
    });
  }

  // ---- Errors ----
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "The request body isn't valid JSON." });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ error: "The request is too large." });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong on our side. Try again in a moment." });
  });

  return app;
}
