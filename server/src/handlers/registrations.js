import { DuplicateError } from "../errors.js";
import { validateRegistration } from "../validation.js";

/** Public registration endpoints. Dependencies are injected so they can be tested. */
export function makeRegistrationHandlers({ repo, config }) {
  return {
    status(req, res) {
      res.json({ open: config.registrationOpen });
    },

    async create(req, res) {
      if (!config.registrationOpen) {
        return res.status(403).json({ error: "Registration is closed." });
      }

      // Honeypot: a hidden field real people never fill in.
      if (typeof req.body?.website === "string" && req.body.website.trim()) {
        return res.status(201).json({ ok: true }); // look successful, store nothing
      }

      const { value, errors } = validateRegistration(req.body);
      if (errors) {
        return res.status(400).json({ error: "Please fix the highlighted fields.", fields: errors });
      }

      try {
        const saved = await repo.insertRegistration(value);
        res.status(201).json({
          ok: true,
          registration: { id: saved.id, status: saved.status, inGameName: saved.inGameName },
        });
      } catch (err) {
        if (err instanceof DuplicateError) {
          return res.status(409).json({
            error: "This email is already registered.",
            fields: { email: "This email is already registered." },
          });
        }
        throw err;
      }
    },
  };
}
