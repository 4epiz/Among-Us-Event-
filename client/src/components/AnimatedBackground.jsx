import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { backgrounds } from "../data/eventData";

export const SCENE_MS = 7000;
const FADE_S = 1.6;

/**
 * Stacks every scene once and crossfades between them by opacity, so no image
 * is ever unmounted or re-requested. The active scene settles from a slight
 * zoom; under reduced motion the zoom is dropped and the fade is shortened.
 */
export default function AnimatedBackground({ index }) {
  const reduce = useReducedMotion();

  // Warm the cache for the scenes that aren't visible yet.
  useEffect(() => {
    backgrounds.slice(1).forEach(({ src }) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      {backgrounds.map((bg, i) => {
        const active = i === index;
        return (
          <motion.div
            key={bg.src}
            className={`bg__slide${bg.layout === "portrait" ? " bg__slide--portrait" : ""}`}
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: reduce ? 0.4 : FADE_S, ease: "easeInOut" }}
            style={{ zIndex: active ? 1 : 0 }}
          >
            <motion.img
              className="bg__img"
              src={bg.src}
              alt=""
              draggable="false"
              loading="eager"
              decoding="async"
              fetchPriority={i === 0 ? "high" : "low"}
              style={{ "--pos": bg.position, "--pos-mobile": bg.mobilePosition }}
              initial={false}
              animate={{ scale: reduce ? 1 : active ? 1 : 1.05 }}
              transition={{
                duration: active ? SCENE_MS / 1000 + FADE_S : 0,
                delay: active ? 0 : FADE_S,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            />
            <div
              className="bg__scrim"
              style={{ "--scrim": bg.scrim, "--scrim-m": bg.scrimMobile }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
