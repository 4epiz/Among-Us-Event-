import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Spinner from "./Spinner";
import { backgrounds, event } from "../data/eventData";

const statuses = [
  "Fixing wiring",
  "Fueling engines",
  "Calibrating distributor",
  "Clearing asteroids",
  "Swiping card",
  "Aligning engine output",
];

const MIN_MS = 1400; // long enough to read, short enough not to annoy
const MAX_MS = 7000; // never trap someone on a slow connection

/**
 * Real loading screen: progress tracks the hero artwork and the web fonts,
 * not a fake timer. Calls onDone once everything is ready (or after MAX_MS).
 */
export default function Preloader({ onDone }) {
  const reduce = useReducedMotion();
  const total = backgrounds.length + 1; // images + fonts
  const [loaded, setLoaded] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const startRef = useRef(performance.now());

  useEffect(() => {
    let cancelled = false;
    const bump = () => !cancelled && setLoaded((n) => n + 1);

    backgrounds.forEach(({ src }) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump;
      img.src = src;
    });
    (document.fonts?.ready ?? Promise.resolve()).then(bump);

    const t = setInterval(() => setStatusIndex((i) => (i + 1) % statuses.length), 650);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const done = loaded >= total;

  useEffect(() => {
    if (done) {
      const wait = Math.max(0, MIN_MS - (performance.now() - startRef.current));
      const t = setTimeout(onDone, reduce ? 0 : wait);
      return () => clearTimeout(t);
    }
    const t = setTimeout(onDone, MAX_MS);
    return () => clearTimeout(t);
  }, [done, onDone, reduce]);

  const pct = Math.round((Math.min(loaded, total) / total) * 100);

  return (
    <motion.div
      className="preloader"
      initial={{ opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { y: "-100%" }}
      transition={{ duration: reduce ? 0.2 : 0.9, ease: [0.76, 0, 0.24, 1] }}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${event.name}`}
    >
      <div className="preloader__inner">
        <div className="preloader__spin">
          <Spinner size={88} />
          <span className="preloader__mark" aria-hidden="true" />
        </div>
        <p className="preloader__name">{event.name}</p>
        <p className="preloader__status">
          <span key={statusIndex} className="preloader__status-text">
            {done ? "Ship ready" : statuses[statusIndex]}
          </span>
        </p>
        <div className="preloader__bar" aria-hidden="true">
          <motion.span
            className="preloader__fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: pct / 100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="preloader__pct" aria-hidden="true">
          Total tasks completed <span>{pct}%</span>
        </p>
      </div>
    </motion.div>
  );
}
