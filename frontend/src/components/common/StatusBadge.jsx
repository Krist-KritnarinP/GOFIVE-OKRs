const TONE_MAP = {
  high: {
    backgroundColor: 'var(--status-high-bg)',
    color: 'var(--status-high-text)',
    borderColor: 'var(--status-high-border)',
  },
  track: {
    backgroundColor: 'var(--status-track-bg)',
    color: 'var(--status-track-text)',
    borderColor: 'var(--status-track-border)',
  },
  warn: {
    backgroundColor: 'var(--status-warn-bg)',
    color: 'var(--status-warn-text)',
    borderColor: 'var(--status-warn-border)',
  },
  low: {
    backgroundColor: 'var(--status-low-bg)',
    color: 'var(--status-low-text)',
    borderColor: 'var(--status-low-border)',
  },
  neutral: {
    backgroundColor: 'var(--surface-subtle)',
    color: 'var(--ink-secondary)',
    borderColor: 'var(--border-subtle)',
  },
};

export function StatusBadge({ tone = 'neutral', children }) {
  const style = TONE_MAP[tone] || TONE_MAP.neutral;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs sm:text-sm font-semibold whitespace-nowrap tabular-nums"
      style={style}
    >
      {children}
    </span>
  );
}
