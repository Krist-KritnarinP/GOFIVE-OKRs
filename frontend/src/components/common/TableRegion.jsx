/**
 * Accessible horizontally scrollable table wrapper (modern-web-guidance: responsive-table).
 * Provides keyboard scrollability (`tabIndex={0}`) and named region landmark.
 */
export function TableRegion({ labelledBy, label, children }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className="overflow-x-auto max-w-full rounded-md focus-visible:outline-2"
    >
      {children}
    </div>
  );
}
