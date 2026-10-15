import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Zap } from "lucide-react";

const AUTO_FIX_MS = 20000;

/**
 * Easter egg: "sabotage" the lights. The page goes dark except for a small
 * circle of vision around the pointer, like the in-game lights sabotage.
 * The fix button is always keyboard-reachable, Escape also fixes it, and the
 * lights come back on their own after a few seconds.
 */
export default function LightsSabotage() {
  const [dark, setDark] = useState(false);
  const overlayRef = useRef(null);
  const fixRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!dark) return;
    const el = overlayRef.current;
    const move = (e) => {
      const p = e.touches ? e.touches[0] : e;
      el?.style.setProperty("--x", `${p.clientX}px`);
      el?.style.setProperty("--y", `${p.clientY}px`);
    };
    const key = (e) => e.key === "Escape" && fix();
    window.addEventListener("pointermove", move);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("keydown", key);
    const t = setTimeout(fix, AUTO_FIX_MS);
    fixRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("keydown", key);
      clearTimeout(t);
    };
  }, [dark]);

  const fix = () => {
    setDark(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const start = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setDark(true);
    requestAnimationFrame(() => {
      overlayRef.current?.style.setProperty("--x", `${r.left + r.width / 2}px`);
      overlayRef.current?.style.setProperty("--y", `${r.top + r.height / 2}px`);
    });
  };

  return (
    <>
      <button ref={triggerRef} type="button" className="sabotage-btn" onClick={start}>
        <Zap size={16} strokeWidth={2} aria-hidden="true" />
        Sabotage the lights
      </button>
      {createPortal(
        <AnimatePresence>
          {dark && (
            <motion.div
              ref={overlayRef}
              className="lights-out"
              role="dialog"
              aria-modal="true"
              aria-label="Lights sabotaged"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="lights-out__msg">
                <p className="lights-out__title">Lights sabotaged</p>
                <p>Move around to see. Find the panel to fix them, or press Escape.</p>
              </div>
              <button ref={fixRef} type="button" className="lights-out__fix" onClick={fix}>
                <Lightbulb size={18} strokeWidth={2} aria-hidden="true" />
                Fix lights
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
