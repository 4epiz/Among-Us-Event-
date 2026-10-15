import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { event } from "../data/eventData";

const units = [
  ["days", 86400000],
  ["hours", 3600000],
  ["minutes", 60000],
  ["seconds", 1000],
];

function split(ms) {
  let rest = Math.max(0, ms);
  return units.map(([label, size]) => {
    const v = Math.floor(rest / size);
    rest -= v * size;
    return [label, v];
  });
}

/** Rolling digits: each changed number slides up and out. */
function Digit({ value }) {
  const text = String(value).padStart(2, "0");
  return (
    <span className="countdown__digits" aria-hidden="true">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={text}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Countdown() {
  const target = event.startsAt ? new Date(event.startsAt).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (!target || Number.isNaN(target)) {
    return (
      <div className="countdown countdown--idle">
        <div className="countdown__grid" aria-hidden="true">
          {units.map(([label]) => (
            <div key={label} className="countdown__cell">
              <span className="countdown__digits">--</span>
              <span className="countdown__unit">{label}</span>
            </div>
          ))}
        </div>
        <p className="countdown__note">The countdown starts as soon as the date is announced.</p>
      </div>
    );
  }

  const parts = split(target - now);
  const live = target - now <= 0;

  return (
    <div className="countdown">
      <p className="visually-hidden">
        {live
          ? "The event has started."
          : `Starts in ${parts.map(([l, v]) => `${v} ${l}`).join(", ")}.`}
      </p>
      <div className="countdown__grid">
        {parts.map(([label, v]) => (
          <div key={label} className="countdown__cell">
            <Digit value={v} />
            <span className="countdown__unit" aria-hidden="true">
              {label}
            </span>
          </div>
        ))}
      </div>
      <p className="countdown__note">{live ? "We're live. Get to your lobby." : "Until the first lobby opens."}</p>
    </div>
  );
}
