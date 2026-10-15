import { CalendarDays, Clock, Globe2, Server, Ticket, Users } from "lucide-react";
import Reveal from "./Reveal";
import Countdown from "./Countdown";
import { event, TBA } from "../data/eventData";

const statusLabel = {
  open: "Registration open",
  soon: "Registration opens soon",
  closed: "Registration closed",
};

export default function EventDetails() {
  const d = event.details;
  const items = [
    { label: "Date", value: d.date, Icon: CalendarDays },
    { label: "Start time", value: d.startTime, Icon: Clock },
    { label: "Time zone", value: d.timeZone, Icon: Globe2 },
    { label: "Venue or server", value: d.venue, Icon: Server },
    { label: "Available slots", value: d.slots, Icon: Users },
    { label: "Registration", value: statusLabel[d.registrationStatus], Icon: Ticket, status: d.registrationStatus },
  ];

  return (
    <section id="details" className="section" aria-labelledby="details-title">
      <div className="container">
        <div className="details__head">
          <Reveal>
            <h2 id="details-title" className="section-title">
              Event details
            </h2>
            <p className="section-intro">
              Everything you need to plan your night. Details are added here as soon as they're
              confirmed.
            </p>
          </Reveal>
          <Countdown />
        </div>

        <dl className="details__list">
          {items.map(({ label, value, Icon, status }) => (
            <div key={label} className={`detail${status ? ` status--${status}` : ""}`}>
              <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              <dt>{label}</dt>
              <dd className={value ? undefined : "is-tba"}>
                {status && <span className="status__dot" aria-hidden="true" />}
                {value ?? TBA}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
