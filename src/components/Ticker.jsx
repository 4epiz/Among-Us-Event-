import { tickerItems } from "../data/eventData";

/** A slanted band of meeting-chat lines that scrolls forever (pure CSS; pauses on hover). */
export default function Ticker() {
  const row = (hidden) => (
    <ul className="ticker__row" aria-hidden={hidden || undefined}>
      {tickerItems.map((t) => (
        <li key={t} className="ticker__item">
          <span className="ticker__dot" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="ticker" role="region" aria-label="Things you'll hear in a meeting">
      <div className="ticker__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
