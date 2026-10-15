import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import { gameFacts } from "../data/eventData";

export default function AboutSection() {
  const figRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: figRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <div className="about__grid">
          <Reveal>
            <h2 id="about-title" className="section-title">
              A game of tasks, talk, and who you choose to believe.
            </h2>
          </Reveal>

          <div className="about__body">
            <p>
              Every lobby starts as a crew with a job to do. Somewhere among you, someone is only
              pretending to help.
            </p>
            <p>
              Crewmates move through the ship finishing tasks while keeping track of who was where.
              When a body is reported or a meeting is called, the game turns into a conversation:
              alibis, accusations, and a vote that can save the ship or sink it.
            </p>
            <p>
              Nobody wins alone. The crews that do well are the ones that share what they saw,
              question what doesn't fit, and still manage to trust each other enough to act.
            </p>
          </div>
        </div>

        <dl className="facts">
          {gameFacts.map((f, i) => (
            <Reveal key={f.label} className="fact" delay={i * 0.08}>
              <dt className="fact__value">
                <CountUp to={f.value} />
              </dt>
              <dd className="fact__label">{f.label}</dd>
            </Reveal>
          ))}
        </dl>

        <figure className="about__figure" ref={figRef}>
          <div className="about__frame">
            <motion.img
              src="/1792072994515_background_image_3.png"
              alt="Crewmates inside a ship's oxygen room, one red crewmate in a hat looking back at an orange crewmate on the floor while a purple crewmate stands by the far wall."
              loading="lazy"
              decoding="async"
              width="1920"
              height="1080"
              style={{ y }}
            />
          </div>
          <figcaption>Who was in O2? Every meeting starts with a question like this.</figcaption>
        </figure>
      </div>
    </section>
  );
}
