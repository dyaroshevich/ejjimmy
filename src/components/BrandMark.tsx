/**
 * The brand mark — one drawing, one place.
 *
 * The header used to inline this SVG, and the only other place that drew a mark (the footer) draws the
 * sheet's numeral instead. A template that changes the mark should not have to find three copies of a
 * `<path>`, so the glyph lives here and takes its size from the caller; the colour is `currentColor`, so
 * the surrounding link keeps deciding it (the header sets brand orange, the admin shell sets slate).
 */
export default function BrandMark({
  size = 21,
  className,
  title,
}: {
  size?: number;
  className?: string;
  /** Only for the rare case the mark is the only label; otherwise it is decorative. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7" />
    </svg>
  );
}
