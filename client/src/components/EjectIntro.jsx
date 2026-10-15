import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SkipForward } from "lucide-react";
import { backgrounds, event } from "../data/eventData";

const CREWMATE = "/intro-crewmate.png"; // cut out from the supplied portrait artwork

const FLIGHT_MS = 4200; // one edge of the screen to the other
const DIRECTION = -1; // -1 = right to left (text uncovers from the right), 1 = left to right
const SPINS = 1.6; // full turns while crossing
const HOLD_MS = 1100; // pause on the finished message
const MAX_MS = 9000; // never trap anyone on a slow connection

const headline = `Welcome to ${event.name}.`;
const subline = "Your crew is waiting.";

/** Slow drifting stars on a canvas, three depths. */
function Stars() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, stars, raf;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 2600);
      stars = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.3 + depth * 1.3,
          a: 0.25 + depth * 0.75,
          v: 4 + depth * 22, // px per second, nearer stars move faster
          tw: Math.random() * Math.PI * 2,
        };
      });
    };

    let last = performance.now();
    const draw = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduce) s.x = (((s.x - DIRECTION * s.v * dt) % (w + 4)) + w + 4) % (w + 4); // drift against the body
        const alpha = s.a * (0.75 + 0.25 * Math.sin(t / 700 + s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,240,${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="intro__stars" aria-hidden="true" />;
}

/**
 * Loading intro styled after the game's ejection screen: a crewmate tumbles
 * through space from right to left, then the welcome types out. It also does
 * the real loading work (hero art, crewmate image, fonts) and only leaves once
 * both the sequence and the loading are done.
 */
export default function EjectIntro({ onDone }) {
  const reduce = useReducedMotion();
  const total = backgrounds.length + 2; // hero images + crewmate + fonts
  const [loaded, setLoaded] = useState(0);
  const [crewReady, setCrewReady] = useState(false);
  const [textDone, setTextDone] = useState(false);
  const [sequenceDone, setSequenceDone] = useState(false);
  const finished = useRef(false);
  const flightRef = useRef(null);
  const textRef = useRef(null);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  // Real loading work.
  useEffect(() => {
    let cancelled = false;
    const bump = () => !cancelled && setLoaded((n) => n + 1);
    backgrounds.forEach(({ src }) => {
      const img = new Image();
      img.onload = img.onerror = bump;
      img.src = src;
    });
    const crew = new Image();
    crew.onload = crew.onerror = () => {
      bump();
      if (!cancelled) setCrewReady(true);
    };
    crew.src = CREWMATE;
    (document.fonts?.ready ?? Promise.resolve()).then(bump);

    const bail = setTimeout(finish, MAX_MS);
    return () => {
      cancelled = true;
      clearTimeout(bail);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock page scroll while the intro is up.
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  // The flight. One frame loop moves the crewmate and uncovers the line right
  // behind it, so the words appear exactly where the body has just passed.
  useEffect(() => {
    if (!crewReady) return;
    const text = textRef.current;
    const body = flightRef.current;

    if (reduce || !body) {
      text?.style.setProperty("--reveal", "100%");
      setTextDone(true);
      const t = setTimeout(() => setSequenceDone(true), 1200);
      return () => clearTimeout(t);
    }

    let raf;
    let doneText = false;
    const start = performance.now();
    const frame = (now) => {
      const p = Math.min(1, (now - start) / FLIGHT_MS);
      const vw = window.innerWidth;
      const crewW = body.offsetWidth;
      const from = DIRECTION > 0 ? -crewW - 24 : vw + 24;
      const to = DIRECTION > 0 ? vw + 24 : -crewW - 24;
      const x = from + (to - from) * p;
      const bob = Math.sin(p * Math.PI * 2) * 6;
      body.style.transform = `translate3d(${x}px, calc(-50% + ${bob}px), 0) rotate(${DIRECTION * p * SPINS * 360}deg)`;

      // Reveal edge sits just behind the body's centre.
      const r = text.getBoundingClientRect();
      const edge = x + crewW / 2 - DIRECTION * crewW * 0.2;
      const shown = DIRECTION > 0 ? edge - r.left : r.right - edge;
      const clamped = Math.max(0, Math.min(r.width, shown));
      text.style.setProperty("--reveal", `${clamped}px`);
      if (!doneText && clamped >= r.width) {
        doneText = true;
        text.style.setProperty("--reveal", "100%");
        setTextDone(true);
      }

      if (p < 1) raf = requestAnimationFrame(frame);
      else setTimeout(() => setSequenceDone(true), HOLD_MS);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [crewReady, reduce]);

  const allLoaded = loaded >= total;

  useEffect(() => {
    if (sequenceDone && allLoaded) {
      const t = setTimeout(finish, 250);
      return () => clearTimeout(t);
    }
  }, [sequenceDone, allLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.round((Math.min(loaded, total) / total) * 100);

  return (
    <motion.div
      className="intro"
      initial={{ opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { y: "-100%" }}
      transition={{ duration: reduce ? 0.3 : 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <Stars />

      <div className="intro__stage">
        <p className="visually-hidden" role="status">
          {headline} {subline}
        </p>
        <div className="intro__row">
          <p
            ref={textRef}
            className={`intro__headline${DIRECTION > 0 ? "" : " is-rtl"}${textDone ? " is-revealed" : ""}`}
            aria-hidden="true"
          >
            {headline}
          </p>
          {!reduce && (
            <div ref={flightRef} className="intro__flight" aria-hidden="true">
              <img
                className="intro__crewmate"
                src={CREWMATE}
                alt=""
                draggable="false"
                style={{
                  visibility: crewReady ? "visible" : "hidden",
                  transform: DIRECTION < 0 ? "scaleX(-1)" : undefined, // face the way it flies
                }}
              />
            </div>
          )}
        </div>
        <p className={`intro__subline${textDone ? " is-in" : ""}`} aria-hidden="true">
          {subline}
        </p>
      </div>
    </motion.div>
  );
}
