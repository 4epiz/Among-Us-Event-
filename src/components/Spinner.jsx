/** A ring spinner with a coral arc. Pure CSS rotation, so it keeps turning even while JS is busy. */
export default function Spinner({ size = 40, label }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      <svg viewBox="0 0 50 50" width={size} height={size}>
        <circle className="spinner__track" cx="25" cy="25" r="21" fill="none" strokeWidth="4" />
        <circle className="spinner__arc" cx="25" cy="25" r="21" fill="none" strokeWidth="4" />
      </svg>
    </span>
  );
}
