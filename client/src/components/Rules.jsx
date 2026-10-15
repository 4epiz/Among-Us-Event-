import { Clock, Gavel, Ghost, MessageSquareWarning, ShieldCheck, WifiOff } from "lucide-react";
import Reveal from "./Reveal";
import { rules } from "../data/eventData";

const icons = [ShieldCheck, Ghost, MessageSquareWarning, Clock, WifiOff, Gavel];

export default function Rules() {
  return (
    <section id="rules" className="section" aria-labelledby="rules-title">
      <div className="container">
        <Reveal>
          <h2 id="rules-title" className="section-title">
            Lobby rules
          </h2>
          <p className="section-intro">
            Short and simple, so every lobby plays the same game. Hosts will go over these in the
            crew briefing.
          </p>
        </Reveal>

        <ul className="rules">
          {rules.map((r, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal as="li" key={r.title} className="rule" delay={(i % 3) * 0.08}>
                <span className="rule__icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="rule__title">{r.title}</h3>
                <p className="rule__body">{r.body}</p>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
