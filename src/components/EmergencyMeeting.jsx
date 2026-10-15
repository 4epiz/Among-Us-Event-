import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Megaphone, RotateCcw, SkipForward } from "lucide-react";
import Reveal from "./Reveal";
import Spinner from "./Spinner";
import { meeting } from "../data/eventData";

const TALLY_MS = 1800;

function Typewriter({ text, onDone }) {
  const reduce = useReducedMotion();
  const chars = Array.from(text);
  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 0 : chars.length * 45 + 500);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <p className="eject__text">
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {chars.map((c, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : i * 0.045, duration: 0.01 }}
          >
            {c}
          </motion.span>
        ))}
      </span>
    </p>
  );
}

export default function EmergencyMeeting() {
  const [phase, setPhase] = useState("voting"); // voting | tallying | ejecting | result
  const [choice, setChoice] = useState(null); // suspect name or "skip"
  const [attempts, setAttempts] = useState(0);
  const [typed, setTyped] = useState(false);
  const resultRef = useRef(null);
  const reduce = useReducedMotion();

  const suspect = meeting.suspects.find((s) => s.name === choice);
  const correct = choice === meeting.impostor;

  const confirm = () => {
    if (!choice) return;
    setAttempts((a) => a + 1);
    setPhase("tallying");
  };

  useEffect(() => {
    if (phase !== "tallying") return;
    const t = setTimeout(() => setPhase("ejecting"), reduce ? 300 : TALLY_MS);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  useEffect(() => {
    if (phase === "result") resultRef.current?.focus();
  }, [phase]);

  const reset = () => {
    setChoice(null);
    setTyped(false);
    setPhase("voting");
  };

  const ejectText =
    choice === "skip"
      ? "No one was ejected. (Skipped)"
      : correct
        ? `${choice} was The Impostor.`
        : `${choice} was not The Impostor.`;

  return (
    <section id="meeting" className="section meeting-section" aria-labelledby="meeting-title">
      <div className="container">
        <div className="meeting__head">
          <Reveal>
            <h2 id="meeting-title" className="section-title">
              Emergency meeting
            </h2>
            <p className="section-intro">
              {meeting.victim.name} was found in {meeting.location}. Read the alibis, then cast your
              vote. One of them is lying.
            </p>
          </Reveal>
          <p className="meeting__attempts" aria-live="polite">
            {attempts > 0 ? `Votes cast: ${attempts}` : "Practice round"}
          </p>
        </div>

        <div className="meeting">
          <div className="meeting__bar">
            <span className="meeting__siren" aria-hidden="true">
              <Megaphone size={18} strokeWidth={2} />
            </span>
            <span>Who is the impostor?</span>
            <span className="meeting__body-found">
              <span className="chip" style={{ "--chip": meeting.victim.color }} aria-hidden="true" />
              {meeting.victim.name}, reported dead
            </span>
          </div>

          <fieldset className="meeting__ballot" disabled={phase !== "voting"}>
            <legend className="visually-hidden">Choose who to vote out</legend>
            <ul className="ballot">
              {meeting.suspects.map((s) => {
                const selected = choice === s.name;
                return (
                  <li key={s.name}>
                    <label className={`ballot__item${selected ? " is-selected" : ""}`}>
                      <input
                        type="radio"
                        name="vote"
                        value={s.name}
                        checked={selected}
                        onChange={() => setChoice(s.name)}
                        className="visually-hidden"
                      />
                      <span className="chip chip--lg" style={{ "--chip": s.color }} aria-hidden="true" />
                      <span className="ballot__text">
                        <span className="ballot__name">{s.name}</span>
                        <span className="ballot__quote">“{s.statement}”</span>
                      </span>
                      <span className="ballot__check" aria-hidden="true">
                        {selected && (
                          <motion.span
                            className="ballot__check-dot"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          />
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className="meeting__actions">
              <label className={`skip${choice === "skip" ? " is-selected" : ""}`}>
                <input
                  type="radio"
                  name="vote"
                  value="skip"
                  checked={choice === "skip"}
                  onChange={() => setChoice("skip")}
                  className="visually-hidden"
                />
                <SkipForward size={16} strokeWidth={2} aria-hidden="true" />
                Skip vote
              </label>
              <motion.button
                type="button"
                className="btn btn--primary"
                onClick={confirm}
                disabled={!choice}
                whileTap={{ scale: 0.97 }}
              >
                Confirm vote
              </motion.button>
            </div>
          </fieldset>

          <AnimatePresence>
            {phase === "tallying" && (
              <motion.div
                key="tally"
                className="meeting__overlay meeting__overlay--tally"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Spinner size={56} label="Counting votes" />
                <p>Counting votes…</p>
              </motion.div>
            )}

            {(phase === "ejecting" || phase === "result") && (
              <motion.div
                key="eject"
                className="meeting__overlay meeting__overlay--eject"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {choice !== "skip" && !reduce && (
                  <motion.span
                    className="eject__body"
                    style={{ "--chip": suspect?.color }}
                    initial={{ x: "-30vw", rotate: 0 }}
                    animate={{ x: "120vw", rotate: 540 }}
                    transition={{ duration: 3.4, ease: "linear" }}
                    aria-hidden="true"
                  />
                )}
                <Typewriter
                  text={ejectText}
                  onDone={() => {
                    setTyped(true);
                    setPhase("result");
                  }}
                />
                <AnimatePresence>
                  {typed && (
                    <motion.div
                      className="eject__result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      ref={resultRef}
                      tabIndex={-1}
                    >
                      <p className={`eject__verdict ${correct ? "is-win" : "is-loss"}`}>
                        {correct ? "Crewmates win. You caught the lie." : "The impostor is still on board."}
                      </p>
                      {correct ? (
                        <p className="eject__explain">{meeting.explanation}</p>
                      ) : (
                        <p className="eject__explain">
                          Hint: compare what Purple saw on the Admin table with who admits being near{" "}
                          {meeting.location}.
                        </p>
                      )}
                      <button type="button" className="btn btn--ghost" onClick={reset}>
                        <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
                        {correct ? "Play again" : "Back to the meeting"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
