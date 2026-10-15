import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import Reveal from "./Reveal";
import { roles } from "../data/eventData";

const teams = [
  { id: "crew", label: "Crewmates" },
  { id: "impostor", label: "Impostors" },
];

export default function Roles() {
  const [team, setTeam] = useState("crew");
  const list = roles.filter((r) => r.team === team);
  const [selected, setSelected] = useState(list[0].name);
  const role = roles.find((r) => r.name === selected) ?? list[0];
  const tabRefs = useRef([]);

  const pickTeam = (id) => {
    setTeam(id);
    setSelected(roles.find((r) => r.team === id).name);
  };

  // Arrow-key navigation between role tabs.
  const onKeyDown = (e, i) => {
    const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + list.length) % list.length;
    setSelected(list[next].name);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="roles" className="section roles-section" aria-labelledby="roles-title">
      <div className="container">
        <div className="roles__head">
          <Reveal>
            <h2 id="roles-title" className="section-title">
              Know every role
            </h2>
            <p className="section-intro">
              Two teams, nine roles. Pick one to see what it can do and how to play it well.
            </p>
          </Reveal>

          <div className="segmented" role="group" aria-label="Team">
            {teams.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`segmented__btn segmented__btn--${t.id}`}
                aria-pressed={team === t.id}
                onClick={() => pickTeam(t.id)}
              >
                {team === t.id && (
                  <motion.span
                    layoutId="team-pill"
                    className="segmented__pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="segmented__label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`roles roles--${team}`}>
          <div className="roles__tabs" role="tablist" aria-label={`${team === "crew" ? "Crewmate" : "Impostor"} roles`} aria-orientation="vertical">
            {list.map((r, i) => {
              const active = r.name === role.name;
              return (
                <button
                  key={r.name}
                  ref={(el) => (tabRefs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`role-tab-${r.name}`}
                  aria-selected={active}
                  aria-controls="role-panel"
                  tabIndex={active ? 0 : -1}
                  className="roles__tab"
                  onClick={() => setSelected(r.name)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  {active && (
                    <motion.span
                      layoutId="role-active"
                      className="roles__tab-bg"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="roles__tab-name">{r.name}</span>
                  <span className="roles__tab-ability">{r.ability}</span>
                </button>
              );
            })}
          </div>

          <div
            className="roles__panel"
            role="tabpanel"
            id="role-panel"
            aria-labelledby={`role-tab-${role.name}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={role.name}
                className="roles__panel-inner"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="roles__team">{role.team === "crew" ? "Crewmate team" : "Impostor team"}</p>
                <h3 className="roles__name">{role.name}</h3>
                <p className="roles__ability">{role.ability}</p>
                <p className="roles__detail">{role.detail}</p>
                <p className="roles__tip">
                  <Lightbulb size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span>
                    <strong>Tip.</strong> {role.tip}
                  </span>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
