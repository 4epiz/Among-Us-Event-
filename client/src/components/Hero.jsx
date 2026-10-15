import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import AnimatedBackground, { SCENE_MS } from "./AnimatedBackground";
import { Link } from "../lib/router";
import { backgrounds } from "../data/eventData";

const ease = [0.22, 1, 0.36, 1];

const lines = ["One crew.", "Zero trust."];

/** Splits a line into letters that rise out of a mask one after another. */
function RisingLine({ text, ready, delay }) {
  return (
    <span className="hero__line" aria-hidden="true">
      {text.split(" ").map((word, w, words) => {
        const offset = words.slice(0, w).join(" ").length + (w ? 1 : 0);
        return (
          <span key={w} className="hero__word">
            {Array.from(word).map((ch, i) => (
              <span key={i} className="hero__char-mask">
                <motion.span
                  className="hero__char"
                  initial={{ y: "110%" }}
                  animate={ready ? { y: "0%" } : { y: "110%" }}
                  transition={{ duration: 0.9, delay: delay + (offset + i) * 0.035, ease }}
                >
                  {ch}
                </motion.span>
              </span>
            ))}
            {w < words.length - 1 && " "}
          </span>
        );
      })}
    </span>
  );
}

export default function Hero({ ready = true }) {
  const enter = (delay) => ({
    initial: { opacity: 0, y: 20 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { duration: 0.8, delay, ease },
  });

  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Reduced motion: start paused; the scenes stay reachable through the controls.
  useEffect(() => {
    if (reduce) setPaused(true);
  }, [reduce]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % backgrounds.length), SCENE_MS);
    return () => clearTimeout(t);
  }, [index, paused]);

  return (
    <section id="home" className="hero" aria-label="Introduction">
      <div className="hero__frame">
        <AnimatedBackground index={index} />

        <div className="hero__content">
          <motion.p className="hero__eyebrow" {...enter(0.05)}>
            An out-of-this-world gaming event
          </motion.p>
          <h1 className="hero__title">
            <span className="visually-hidden">{lines.join(" ")}</span>
            {lines.map((line, i) => (
              <RisingLine key={line} text={line} ready={ready} delay={0.15 + i * 0.25} />
            ))}
          </h1>
          <motion.p className="hero__text" {...enter(0.75)}>
            Gather your crew, complete your tasks, and uncover the impostor in an Among Us event
            built for strategy, teamwork, and unforgettable moments.
          </motion.p>
          <motion.div className="hero__actions" {...enter(0.9)}>
            <Link className="btn btn--primary" to="/register">
              Register for the Event
              <ArrowRight className="btn__arrow" size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
            <motion.a className="btn btn--ghost" href="#about" whileTap={{ scale: 0.97 }}>
              Explore Event
            </motion.a>
          </motion.div>
        </div>

        <div className="hero__footer">
          <a className="scroll-cue" href="#about">
            <span className="scroll-cue__icon" aria-hidden="true">
              <ArrowDown size={16} strokeWidth={2} />
            </span>
            <span>Scroll to explore</span>
          </a>

          <div className="scenes" role="group" aria-label="Background artwork">
            <div className="scenes__track">
              {backgrounds.map((bg, i) => (
                <button
                  key={bg.src}
                  type="button"
                  className="scenes__dot"
                  aria-label={`Show scene ${i + 1}: ${bg.label}`}
                  aria-pressed={i === index}
                  onClick={() => setIndex(i)}
                >
                  {i === index && (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="scenes__fill"
                      initial={{ scaleX: paused ? 1 : 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: paused ? 0 : SCENE_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="scenes__pause"
              aria-label={paused ? "Play background animation" : "Pause background animation"}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? <Play size={14} strokeWidth={2} /> : <Pause size={14} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
