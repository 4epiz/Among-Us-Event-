import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "./Reveal";
import { event, faqs } from "../data/eventData";

function FaqItem({ item, open, onToggle }) {
  const id = useId();
  const reduce = useReducedMotion();
  const buttonId = `${id}-q`;
  const panelId = `${id}-a`;

  return (
    <li className="faq__item">
      <h3 className="faq__q">
        <button
          id={buttonId}
          type="button"
          className="faq__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{item.q}</span>
          <span className="faq__icon" aria-hidden="true">
            <Plus size={18} strokeWidth={1.75} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="faq__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="faq__answer">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className="container faq">
        <Reveal className="faq__intro">
          <h2 id="faq-title" className="section-title">
            Questions, answered
          </h2>
          <p className="section-intro">
            {event.communityUrl ? (
              <>
                Something we missed? Ask the organisers on{" "}
                <a className="text-link" href={event.communityUrl} target="_blank" rel="noopener noreferrer">
                  {event.communityLabel}
                </a>
                .
              </>
            ) : (
              "The things players ask most before signing up."
            )}
          </p>
        </Reveal>

        <ul className="faq__list">
          {faqs.map((item, i) => (
            <FaqItem
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
