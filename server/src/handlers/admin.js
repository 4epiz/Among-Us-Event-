import { isUuid, validateListQuery, validateStatusUpdate } from "../validation.js";

/**
 * Admin endpoints. Dependencies are injected so they can be tested:
 *   repo            - the database repository (see db.js)
 *   auth            - session helpers (see auth.js)
 *   comparePassword - (plain, hash) => Promise<boolean>
 *   dummyHash       - a real hash compared against when the username is unknown,
 *                     so a wrong username takes as long as a wrong password
 */
export function makeAdminHandlers({ repo, auth, comparePassword, dummyHash }) {
  return {
    async login(req, res) {
      const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!username || !password) {
        return res.status(400).json({ error: "Enter your username and password." });
      }

      const admin = await repo.findAdminByUsername(username);
      const ok = await comparePassword(password, admin?.passwordHash ?? dummyHash);
      if (!admin || !ok) {
        return res.status(401).json({ error: "Incorrect username or password." });
      }

      auth.issue(res, admin);
      res.json({ admin: { username: admin.username } });
    },

    logout(req, res) {
      auth.clear(res);
      res.json({ ok: true });
    },

    me(req, res) {
      res.json({ admin: { username: req.admin.username } });
    },

    async list(req, res) {
      const q = validateListQuery(req.query);
      const [{ rows, total }, counts] = await Promise.all([
        repo.listRegistrations(q),
        repo.countByStatus(),
      ]);
      res.json({
        registrations: rows,
        counts,
        page: q.page,
        pageSize: q.limit,
        total,
        pages: Math.max(1, Math.ceil(total / q.limit)),
      });
    },

    async updateStatus(req, res) {
      if (!isUuid(req.params.id)) {
        return res.status(404).json({ error: "Registration not found." });
      }
      const { value, errors } = validateStatusUpdate(req.body);
      if (errors) return res.status(400).json({ error: "Invalid update.", fields: errors });

      const updated = await repo.updateRegistrationStatus(req.params.id, {
        ...value,
        reviewedBy: req.admin.username,
      });
      if (!updated) return res.status(404).json({ error: "Registration not found." });

      const counts = await repo.countByStatus();
      res.json({ registration: updated, counts });
    },
  };
}
