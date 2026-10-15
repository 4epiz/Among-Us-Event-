import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { navLinks } from "../data/eventData";
import Wordmark from "./Wordmark";
import { Link } from "../lib/router";

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const ids = navLinks.map((l) => l.id);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(ids);
  const toggleRef = useRef(null);
  const firstLinkRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock scroll, move focus in, close on Escape, close on resize to desktop.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 1081px)");
    const onMq = (e) => e.matches && setOpen(false);

    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={`nav${scrolled || open ? " nav--scrolled" : ""}`}>
        <div className="nav__bar">
          <Wordmark onClick={close} />

          <nav className="nav__primary" aria-label="Primary">
            <ul className="nav__links">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    className="nav__link"
                    href={`#${link.id}`}
                    aria-current={active === link.id ? "true" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav__actions">
            <Link className="btn btn--primary btn--sm nav__register" to="/register">
              Register Now
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="nav__toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <nav aria-label="Mobile">
              <motion.ul
                className="mobile-menu__links"
                initial={{ y: 16 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {navLinks.map((link, i) => (
                  <li key={link.id}>
                    <a
                      ref={i === 0 ? firstLinkRef : undefined}
                      className="mobile-menu__link"
                      href={`#${link.id}`}
                      aria-current={active === link.id ? "true" : undefined}
                      onClick={close}
                    >
                      {link.label}
                      <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </motion.ul>
            </nav>
            <Link className="btn btn--primary" to="/register" onClick={close}>
              Register Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
