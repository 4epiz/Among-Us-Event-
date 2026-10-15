import { ArrowUpRight } from "lucide-react";
import Wordmark from "./Wordmark";
import LightsSabotage from "./LightsSabotage";
import { event, navLinks } from "../data/eventData";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__about">
            <Wordmark />
            <p>{event.description}</p>
          </div>

          <nav className="footer__nav" aria-label="Footer">
            <ul>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__side">
          <LightsSabotage />
          {event.communityUrl && (
            <a
              className="footer__community"
              href={event.communityUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join us on {event.communityLabel}
              <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
          )}
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            © {year} {event.name}. A fan-organised community event.
          </p>
          <p>Not affiliated with or endorsed by Innersloth. Among Us is a trademark of Innersloth LLC.</p>
        </div>
      </div>
    </footer>
  );
}
