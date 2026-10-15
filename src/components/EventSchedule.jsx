import Reveal from "./Reveal";
import { event, schedule } from "../data/eventData";

export default function EventSchedule() {
  const tz = event.details.timeZone;

  return (
    <section id="schedule" className="section schedule-section" aria-labelledby="schedule-title">
      <div className="container schedule">
        <Reveal className="schedule__intro">
          <h2 id="schedule-title" className="section-title">
            Schedule
          </h2>
          <p className="section-intro">
            One evening, five parts. Arrive for check-in so your lobby can start on time.
          </p>
          <p className="schedule__note">
            {tz ? `All times in ${tz}.` : "Times will be published with the event date."}
          </p>
        </Reveal>

        <ol className="schedule__list">
          {schedule.map((item) => (
            <li key={item.title} className="slot">
              <span className={`slot__time${item.time ? "" : " is-tba"}`}>
                {item.time ?? "TBA"}
              </span>
              <div>
                <h3 className="slot__title">{item.title}</h3>
                <p className="slot__body">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
