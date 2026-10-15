import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Reveal from "./Reveal";
import { steps } from "../data/eventData";

export default function HowItWorks() {
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section className="section steps-section band" aria-labelledby="how-title">
      <div className="container">
        <Reveal>
          <h2 id="how-title" className="section-title">
            How a round plays out
          </h2>
          <p className="section-intro">Four stages, from the lobby to the final vote.</p>
        </Reveal>

        <div className="steps-wrap" ref={listRef}>
          <div className="steps__rail" aria-hidden="true">
            <motion.span className="steps__fill steps__fill--x" style={{ scaleX: progress }} />
            <motion.span className="steps__fill steps__fill--y" style={{ scaleY: progress }} />
          </div>
          <ol className="steps">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.title} className="step" delay={i * 0.1}>
                <span className="step__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="step__title">{step.title}</h3>
                  <p className="step__body">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
