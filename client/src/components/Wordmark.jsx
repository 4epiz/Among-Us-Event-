import { event } from "../data/eventData";
import { Link } from "../lib/router";

/** The event wordmark. Internal paths ("/") navigate without reloading the page. */
export default function Wordmark({ href = "#home", onClick }) {
  const label = href === "/" ? `${event.name}, home` : `${event.name}, back to top`;
  const inner = (
    <>
      <span className="wordmark__mark" aria-hidden="true" />
      <span>{event.name}</span>
    </>
  );
  return href.startsWith("/") ? (
    <Link className="wordmark" to={href} onClick={onClick} aria-label={label}>
      {inner}
    </Link>
  ) : (
    <a className="wordmark" href={href} onClick={onClick} aria-label={label}>
      {inner}
    </a>
  );
}
