import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "../lib/router";
import { useRegistrationOpen } from "../lib/useRegistrationOpen";

export default function RegistrationCTA() {
  const url = event.registrationUrl || "/register";
  const external = /^https?:\/\//.test(url);
  const serverOpen = useRegistrationOpen();
  const available = external || serverOpen !== false;
  const meta = available
    ? "It takes about a minute. Organisers review every registration."
    : "Registration is closed right now. Check back for updates.";

  return (
    <section id="register" className="section" aria-labelledby="register-title">
      <div className="container">
        <div className="register">
          <div className="register__body">
            <h2 id="register-title" className="register__title">
              Ready to find the impostor?
            </h2>
            <p className="register__text">
              Save your place in a lobby. Sign up on your own or bring your crew along.
            </p>
            <div className="register__actions">
              {available && !external ? (
                <Link className="btn btn--primary" to={url}>
                  Register for the Event
                </Link>
              ) : available ? (
                <motion.a
                  className="btn btn--primary"
                  href={url}
                  whileTap={{ scale: 0.97 }}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  Register for the Event
                  {external && <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />}
                  {external && <span className="visually-hidden">(opens in a new tab)</span>}
                </motion.a>
              ) : (
                <button type="button" className="btn btn--primary" aria-disabled="true" disabled>
                  Register for the Event
                </button>
              )}
              <p className="register__meta">{meta}</p>
            </div>
          </div>
          <div className="register__art">
            <img
              src="/1792072994516_background_image_2.png"
              alt="A large red crewmate floating in space, surrounded by smaller crewmates."
              loading="lazy"
              decoding="async"
              width="600"
              height="900"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
