import { event } from "../data/eventData";

export default function Wordmark({ href = "#home", onClick }) {
  return (
    <a className="wordmark" href={href} onClick={onClick} aria-label={`${event.name}, back to top`}>
      <span className="wordmark__mark" aria-hidden="true" />
      <span>{event.name}</span>
    </a>
  );
}
