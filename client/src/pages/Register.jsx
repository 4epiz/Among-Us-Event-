import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronDown, Clock, Users } from "lucide-react";
import Wordmark from "../components/Wordmark";
import Spinner from "../components/Spinner";
import { Link, usePageMeta } from "../lib/router";
import { api } from "../lib/api";
import { event, rules, TBA } from "../data/eventData";

const PLATFORMS = [
  { value: "pc", label: "PC" },
  { value: "mobile", label: "Mobile" },
  { value: "console", label: "Console" },
];

const EXPERIENCE = [
  { value: "new", label: "New", hint: "Played a few times, or not at all" },
  { value: "casual", label: "Casual", hint: "Play now and then with friends" },
  { value: "regular", label: "Regular", hint: "Know the maps and the meta" },
  { value: "competitive", label: "Competitive", hint: "Play in organised lobbies" },
];

const EMPTY = {
  fullName: "",
  email: "",
  inGameName: "",
  discord: "",
  platform: "",
  experience: "",
  playWith: "",
  notes: "",
  agreeRules: false,
  website: "", // honeypot, hidden from people
};

/** Mirrors the server rules so most mistakes are caught before sending. */
function check(f) {
  const e = {};
  if (f.fullName.trim().length < 2) e.fullName = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!f.inGameName.trim()) e.inGameName = "Enter the name you use in Among Us.";
  else if (f.inGameName.trim().length > 10) e.inGameName = "Among Us names are 10 characters at most.";
  if (f.discord.trim() && f.discord.trim().length < 2) e.discord = "Discord usernames are at least 2 characters.";
  if (!f.platform) e.platform = "Choose the platform you'll play on.";
  if (!f.experience) e.experience = "Choose your experience level.";
  if (!f.agreeRules) e.agreeRules = "Please agree to the lobby rules.";
  return e;
}

function Field({ label, hint, error, optional, children, id, count }) {
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <div className="field__top">
        <label className="field__label" htmlFor={id}>
          {label}
          {optional && <span className="field__optional">Optional</span>}
        </label>
        {count}
      </div>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  usePageMeta(`Register — ${event.name}`);
  const uid = useId();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [open, setOpen] = useState(null); // null = checking
  const formErrorRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    api("/registrations/status")
      .then((d) => setOpen(d.open))
      .catch(() => setOpen(true)); // if the check fails, let the submit report the real error
  }, []);

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  const set = (name) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
  };

  const describe = (name, hasHint) =>
    errors[name] ? `${uid}-${name}-error` : hasHint ? `${uid}-${name}-hint` : undefined;

  const submit = async (e) => {
    e.preventDefault();
    const found = check(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setFormError("Please fix the highlighted fields.");
      requestAnimationFrame(() => {
        document.getElementById(`${uid}-${Object.keys(found)[0]}`)?.focus();
      });
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      const res = await api("/registrations", { method: "POST", body: form });
      setDone({ inGameName: res.registration?.inGameName ?? form.inGameName.trim() });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      if (err.status === 403) setOpen(false);
      setFormError(err.message);
      requestAnimationFrame(() => formErrorRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  };

  const d = event.details;
  const facts = [
    { Icon: CalendarDays, label: "Date", value: d.date ?? TBA },
    { Icon: Clock, label: "Start", value: d.startTime ? `${d.startTime}${d.timeZone ? ` ${d.timeZone}` : ""}` : TBA },
    { Icon: Users, label: "Slots", value: d.slots ?? TBA },
  ];

  return (
    <div className="page reg-page">
      <header className="page-header">
        <Wordmark href="/" />
        <Link className="page-header__back" to="/">
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Back to the event
        </Link>
      </header>

      <main className="reg">
        <aside className="reg__aside on-dark">
          <div className="reg__aside-body">
            <p className="reg__kicker">Registration</p>
            <h1 className="reg__title">Join the crew.</h1>
            <p className="reg__lede">
              Save your seat for {event.name}. Organisers review every registration by hand and
              place players into balanced lobbies.
            </p>
            <dl className="reg__facts">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="reg__fact">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <img className="reg__art" src="/intro-crewmate.png" alt="" aria-hidden="true" />
        </aside>

        <section className="reg__main" aria-label="Registration form">
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div
                key="done"
                className="reg-done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                ref={successRef}
                tabIndex={-1}
              >
                <img className="reg-done__crew" src="/intro-crewmate.png" alt="" aria-hidden="true" />
                <p className="reg-done__status">
                  <span className="status__dot" aria-hidden="true" />
                  Pending review
                </p>
                <h2 className="reg-done__title">You're on the list, {done.inGameName}.</h2>
                <p className="reg-done__text">
                  We've received your registration. The organisers will review it and confirm your
                  place. Nothing else to do for now.
                </p>
                <div className="reg-done__actions">
                  <Link className="btn btn--primary" to="/">
                    Back to the event
                  </Link>
                </div>
              </motion.div>
            ) : open === false ? (
              <div key="closed" className="reg-closed">
                <h2 className="reg-closed__title">Registration is closed.</h2>
                <p>We're not taking new registrations right now. Check the event page for updates.</p>
                <Link className="btn btn--primary" to="/">
                  Back to the event
                </Link>
              </div>
            ) : (
              <motion.form key="form" className="reg-form" onSubmit={submit} noValidate exit={{ opacity: 0 }}>
                <div className="reg-form__head">
                  <h2 className="reg-form__title">Your details</h2>
                  <p className="reg-form__sub">Fields marked optional can be left blank.</p>
                </div>

                {formError && (
                  <div className="form-alert" role="alert" tabIndex={-1} ref={formErrorRef}>
                    {formError}
                  </div>
                )}

                <div className="reg-form__grid">
                  <Field id={`${uid}-fullName`} label="Full name" error={errors.fullName}>
                    <input
                      id={`${uid}-fullName`}
                      className="input"
                      autoComplete="name"
                      maxLength={80}
                      value={form.fullName}
                      onChange={set("fullName")}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={describe("fullName")}
                    />
                  </Field>

                  <Field id={`${uid}-email`} label="Email" error={errors.email} hint="Only used by the organisers to reach you.">
                    <input
                      id={`${uid}-email`}
                      className="input"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      value={form.email}
                      onChange={set("email")}
                      aria-invalid={!!errors.email}
                      aria-describedby={describe("email", true)}
                    />
                  </Field>

                  <Field
                    id={`${uid}-inGameName`}
                    label="In-game name"
                    error={errors.inGameName}
                    hint="Exactly as it appears in Among Us."
                    count={<span className="field__count">{form.inGameName.length}/10</span>}
                  >
                    <input
                      id={`${uid}-inGameName`}
                      className="input"
                      maxLength={10}
                      autoComplete="nickname"
                      value={form.inGameName}
                      onChange={set("inGameName")}
                      aria-invalid={!!errors.inGameName}
                      aria-describedby={describe("inGameName", true)}
                    />
                  </Field>

                  <Field id={`${uid}-discord`} label="Discord username" optional error={errors.discord}>
                    <input
                      id={`${uid}-discord`}
                      className="input"
                      maxLength={37}
                      value={form.discord}
                      onChange={set("discord")}
                      aria-invalid={!!errors.discord}
                      aria-describedby={describe("discord")}
                    />
                  </Field>
                </div>

                <fieldset className={`choice-group${errors.platform ? " has-error" : ""}`}>
                  <legend className="field__label">Platform</legend>
                  <div className="pills">
                    {PLATFORMS.map((p, i) => (
                      <label key={p.value} className={`pill${form.platform === p.value ? " is-on" : ""}`}>
                        <input
                          id={i === 0 ? `${uid}-platform` : undefined}
                          type="radio"
                          name="platform"
                          value={p.value}
                          checked={form.platform === p.value}
                          onChange={set("platform")}
                          className="visually-hidden"
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                  {errors.platform && <p className="field__error">{errors.platform}</p>}
                </fieldset>

                <fieldset className={`choice-group${errors.experience ? " has-error" : ""}`}>
                  <legend className="field__label">Experience</legend>
                  <div className="xp">
                    {EXPERIENCE.map((x, i) => (
                      <label key={x.value} className={`xp__opt${form.experience === x.value ? " is-on" : ""}`}>
                        <input
                          id={i === 0 ? `${uid}-experience` : undefined}
                          type="radio"
                          name="experience"
                          value={x.value}
                          checked={form.experience === x.value}
                          onChange={set("experience")}
                          className="visually-hidden"
                        />
                        <span className="xp__label">{x.label}</span>
                        <span className="xp__hint">{x.hint}</span>
                      </label>
                    ))}
                  </div>
                  {errors.experience && <p className="field__error">{errors.experience}</p>}
                </fieldset>

                <Field
                  id={`${uid}-playWith`}
                  label="Who do you want to play with?"
                  optional
                  error={errors.playWith}
                  hint="Friends' names or Discord usernames. We'll try to keep you together."
                >
                  <input
                    id={`${uid}-playWith`}
                    className="input"
                    maxLength={120}
                    value={form.playWith}
                    onChange={set("playWith")}
                    aria-describedby={describe("playWith", true)}
                  />
                </Field>

                <Field id={`${uid}-notes`} label="Anything else we should know?" optional error={errors.notes}>
                  <textarea
                    id={`${uid}-notes`}
                    className="input input--area"
                    rows={3}
                    maxLength={500}
                    value={form.notes}
                    onChange={set("notes")}
                    aria-describedby={describe("notes")}
                  />
                </Field>

                {/* Honeypot: hidden from people, tempting for bots. */}
                <div className="hp" aria-hidden="true">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
                  </label>
                </div>

                <details className="rules-peek">
                  <summary>
                    Read the lobby rules
                    <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                  </summary>
                  <ul>
                    {rules.map((r) => (
                      <li key={r.title}>
                        <strong>{r.title}.</strong> {r.body}
                      </li>
                    ))}
                  </ul>
                </details>

                <div className={`agree${errors.agreeRules ? " has-error" : ""}`}>
                  <label className="agree__label">
                    <input
                      id={`${uid}-agreeRules`}
                      type="checkbox"
                      checked={form.agreeRules}
                      onChange={set("agreeRules")}
                      aria-invalid={!!errors.agreeRules}
                      aria-describedby={errors.agreeRules ? `${uid}-agreeRules-error` : undefined}
                    />
                    <span className="agree__box" aria-hidden="true">
                      <CheckCircle2 size={18} strokeWidth={2.25} />
                    </span>
                    I agree to play by the lobby rules.
                  </label>
                  {errors.agreeRules && (
                    <p className="field__error" id={`${uid}-agreeRules-error`}>
                      {errors.agreeRules}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn btn--primary reg-form__submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner size={18} /> Sending…
                    </>
                  ) : (
                    "Submit registration"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
