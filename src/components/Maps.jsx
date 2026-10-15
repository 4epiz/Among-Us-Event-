import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Reveal from "./Reveal";
import { maps } from "../data/eventData";

// One accent per map, cycling through the palette.
const accents = ["var(--coral)", "var(--sky)", "var(--lavender)", "var(--yellow)", "var(--mint)"];

export default function Maps() {
  const [open, setOpen] = useState(0);

  return (
    <section id="maps" className="section" aria-labelledby="maps-title">
      <div className="container">
        <Reveal>
          <h2 id="maps-title" className="section-title">
            Five maps, five ways to lie
          </h2>
          <p className="section-intro">
            Each map changes how kills happen and how alibis hold up. Open one to learn its quirks.
          </p>
        </Reveal>

        <ul className="maps">
          {maps.map((m, i) => {
            const isOpen = open === i;
            return (
              <li
                key={m.name}
                className={`map${isOpen ? " map--open" : ""}`}
                style={{ "--accent": accents[i] }}
              >
                <h3 className="map__heading">
                  <button
                    type="button"
                    className="map__trigger"
                    aria-expanded={isOpen}
                    aria-controls={`map-${i}`}
                    onClick={() => setOpen(i)}
                    onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setOpen(i)}
                  >
                    <span className="map__index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="map__name">{m.name}</span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`map-${i}`}
                      className="map__body"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.3 } }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    >
                      <p className="map__setting">{m.setting}</p>
                      <p className="map__text">{m.body}</p>
                      <p className="map__sabotage">
                        <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
                        Critical sabotage: {m.sabotage}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
