import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import Wordmark from "../components/Wordmark";
import Spinner from "../components/Spinner";
import { Link, usePageMeta } from "../lib/router";
import { api } from "../lib/api";
import { event } from "../data/eventData";

const STATUS_LABEL = { pending: "Pending", accepted: "Accepted", rejected: "Rejected" };
const PLATFORM_LABEL = { pc: "PC", mobile: "Mobile", console: "Console" };
const XP_LABEL = { new: "New", casual: "Casual", regular: "Regular", competitive: "Competitive" };

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */
function Login({ onLoggedIn, notice }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await api("/admin/login", { method: "POST", body: { username: username.trim(), password } });
      onLoggedIn(res.admin);
    } catch (err) {
      setError(err.message);
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page page--center admin-login-page">
      <form className="admin-login" onSubmit={submit} noValidate>
        <Wordmark href="/" />
        <h1 className="admin-login__title">Admin sign in</h1>
        <p className="admin-login__sub">Review and manage registrations for {event.name}.</p>

        {(error || notice) && (
          <div className="form-alert" role="alert">
            {error || notice}
          </div>
        )}

        <div className="field">
          <label className="field__label" htmlFor="admin-user">
            Username
          </label>
          <input
            id="admin-user"
            className="input"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="admin-pass">
            Password
          </label>
          <div className="input-wrap">
            <input
              id="admin-pass"
              className="input"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="input-wrap__btn"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
            >
              {show ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn--primary admin-login__submit" disabled={busy}>
          {busy ? (
            <>
              <Spinner size={18} /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
        <Link className="admin-login__back" to="/">
          Back to the event
        </Link>
      </form>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* One registration row                                                */
/* ------------------------------------------------------------------ */
function Row({ reg, busy, onSetStatus }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(reg.adminNote ?? "");
  useEffect(() => setNote(reg.adminNote ?? ""), [reg.adminNote]);
  const noteChanged = (note.trim() || null) !== (reg.adminNote ?? null);
  const detailsId = `reg-${reg.id}`;

  return (
    <li className={`row row--${reg.status}${open ? " is-open" : ""}`}>
      <div className="row__main">
        <div className="row__who">
          <p className="row__name">{reg.fullName}</p>
          <p className="row__email">{reg.email}</p>
        </div>
        <div className="row__cell" data-label="In-game">
          <span className="row__ign">{reg.inGameName}</span>
        </div>
        <div className="row__cell" data-label="Discord">
          {reg.discord || <span className="row__none">None</span>}
        </div>
        <div className="row__cell" data-label="Platform">
          {PLATFORM_LABEL[reg.platform]} · {XP_LABEL[reg.experience]}
        </div>
        <div className="row__cell" data-label="Registered">
          {fmtDate(reg.createdAt)}
        </div>
        <div className="row__cell row__status-cell">
          <span className={`badge badge--${reg.status}`}>{STATUS_LABEL[reg.status]}</span>
        </div>
        <div className="row__actions">
          {busy ? (
            <span className="row__busy">
              <Spinner size={20} label="Saving" />
            </span>
          ) : reg.status === "pending" ? (
            <>
              <button type="button" className="act act--accept" onClick={() => onSetStatus(reg, "accepted")}>
                <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                Accept
              </button>
              <button type="button" className="act act--reject" onClick={() => onSetStatus(reg, "rejected")}>
                <X size={16} strokeWidth={2.5} aria-hidden="true" />
                Reject
              </button>
            </>
          ) : (
            <button type="button" className="act act--reset" onClick={() => onSetStatus(reg, "pending")}>
              <RotateCcw size={15} strokeWidth={2.25} aria-hidden="true" />
              Undo
            </button>
          )}
          <button
            type="button"
            className="act act--more"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="visually-hidden">{open ? "Hide" : "Show"} details for {reg.fullName}</span>
            <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={detailsId}
            className="row__details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="row__details-inner">
              <dl className="row__dl">
                <div>
                  <dt>Wants to play with</dt>
                  <dd>{reg.playWith || <span className="row__none">No one listed</span>}</dd>
                </div>
                <div>
                  <dt>Notes from player</dt>
                  <dd>{reg.notes || <span className="row__none">None</span>}</dd>
                </div>
                <div>
                  <dt>Reviewed</dt>
                  <dd>
                    {reg.reviewedBy ? (
                      `${STATUS_LABEL[reg.status]} by ${reg.reviewedBy}, ${fmtDate(reg.reviewedAt)}`
                    ) : (
                      <span className="row__none">Not yet</span>
                    )}
                  </dd>
                </div>
              </dl>
              <form
                className="row__note"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSetStatus(reg, reg.status, note);
                }}
              >
                <label className="field__label" htmlFor={`note-${reg.id}`}>
                  Admin note <span className="field__optional">Only admins see this</span>
                </label>
                <textarea
                  id={`note-${reg.id}`}
                  className="input input--area"
                  rows={2}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Lobby 3, plays with Ravi"
                />
                <button type="submit" className="btn btn--sm btn--ink" disabled={!noteChanged || busy}>
                  Save note
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */
const FILTERS = [
  { key: null, label: "All", countKey: "total" },
  { key: "pending", label: "Pending", countKey: "pending" },
  { key: "accepted", label: "Accepted", countKey: "accepted" },
  { key: "rejected", label: "Rejected", countKey: "rejected" },
];

function Dashboard({ admin, onLoggedOut, onExpired }) {
  const [filter, setFilter] = useState("pending");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [toast, setToast] = useState("");
  const toastTimer = useRef();

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) onExpired(err.message);
      else setError(err.message);
    },
    [onExpired]
  );

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filter) params.set("status", filter);
      if (search) params.set("q", search);
      try {
        setData(await api(`/admin/registrations?${params}`, { signal }));
      } catch (err) {
        if (err.name !== "AbortError") handleError(err);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [filter, search, page, handleError]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };

  const setStatus = async (reg, status, adminNote) => {
    setBusyIds((s) => new Set(s).add(reg.id));
    try {
      const body = adminNote === undefined ? { status } : { status, adminNote };
      const res = await api(`/admin/registrations/${reg.id}`, { method: "PATCH", body });
      setData((d) => ({
        ...d,
        counts: res.counts,
        registrations: d.registrations.map((r) => (r.id === reg.id ? res.registration : r)),
      }));
      flash(
        adminNote !== undefined
          ? "Note saved."
          : status === "pending"
            ? `${reg.inGameName} moved back to pending.`
            : `${reg.inGameName} ${status}.`
      );
    } catch (err) {
      handleError(err);
    } finally {
      setBusyIds((s) => {
        const n = new Set(s);
        n.delete(reg.id);
        return n;
      });
    }
  };

  const logout = async () => {
    try {
      await api("/admin/logout", { method: "POST" });
    } finally {
      onLoggedOut();
    }
  };

  const counts = data?.counts ?? { total: 0, pending: 0, accepted: 0, rejected: 0 };

  return (
    <div className="page admin">
      <header className="admin__bar">
        <div className="admin__brand">
          <Wordmark href="/" />
          <span className="admin__tag">Admin</span>
        </div>
        <div className="admin__user">
          <span className="admin__name">Signed in as {admin.username}</span>
          <button type="button" className="btn btn--sm btn--outline" onClick={logout}>
            <LogOut size={15} strokeWidth={2} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>

      <main className="admin__main">
        <div className="admin__head">
          <h1 className="admin__title">Registrations</h1>
          <p className="admin__sub">Accept or reject players. Applicants aren't emailed automatically.</p>
        </div>

        <div className="stats" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              className={`stat stat--${f.key ?? "all"}`}
              aria-pressed={filter === f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
            >
              <span className="stat__label">{f.label}</span>
              <span className="stat__value">{counts[f.countKey]}</span>
            </button>
          ))}
        </div>

        <div className="toolbar">
          <label className="search">
            <Search size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className="visually-hidden">Search registrations</span>
            <input
              type="search"
              placeholder="Search name, email, in-game name or Discord"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn--sm btn--outline" onClick={() => load()} disabled={loading}>
            <RefreshCw size={15} strokeWidth={2} aria-hidden="true" className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="form-alert" role="alert">
            {error}
          </div>
        )}

        <div className="table" aria-busy={loading}>
          <div className="table__head" aria-hidden="true">
            <span>Player</span>
            <span>In-game</span>
            <span>Discord</span>
            <span>Platform</span>
            <span>Registered</span>
            <span>Status</span>
            <span />
          </div>

          {!data && loading ? (
            <div className="table__empty">
              <Spinner size={36} label="Loading registrations" />
            </div>
          ) : data?.registrations.length ? (
            <ul className="table__rows">
              {data.registrations.map((r) => (
                <Row key={r.id} reg={r} busy={busyIds.has(r.id)} onSetStatus={setStatus} />
              ))}
            </ul>
          ) : (
            <div className="table__empty">
              <p className="table__empty-title">
                {search
                  ? `No registrations match "${search}".`
                  : filter
                    ? `No ${STATUS_LABEL[filter].toLowerCase()} registrations.`
                    : "No registrations yet."}
              </p>
              <p>
                {search || filter
                  ? "Try a different filter or search."
                  : "Share the registration link and they'll show up here."}
              </p>
            </div>
          )}
        </div>

        {data && data.pages > 1 && (
          <nav className="pager" aria-label="Pages">
            <button
              type="button"
              className="btn btn--sm btn--outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
              Previous
            </button>
            <span className="pager__label">
              Page {data.page} of {data.pages}
            </span>
            <button
              type="button"
              className="btn btn--sm btn--outline"
              disabled={page >= data.pages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </nav>
        )}
      </main>

      <div className="toast-region" role="status" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast}
              className="toast"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Admin() {
  usePageMeta(`Admin — ${event.name}`, { noindex: true });
  const [admin, setAdmin] = useState(undefined); // undefined = checking session
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api("/admin/me")
      .then((d) => setAdmin(d.admin))
      .catch(() => setAdmin(null));
  }, []);

  const expired = useCallback((msg) => {
    setNotice(msg || "Your session has expired. Sign in again.");
    setAdmin(null);
  }, []);

  if (admin === undefined) {
    return (
      <main className="page page--center">
        <Spinner size={40} label="Checking your session" />
      </main>
    );
  }

  if (!admin) {
    return (
      <Login
        notice={notice}
        onLoggedIn={(a) => {
          setNotice("");
          setAdmin(a);
        }}
      />
    );
  }

  return <Dashboard admin={admin} onExpired={expired} onLoggedOut={() => setAdmin(null)} />;
}
