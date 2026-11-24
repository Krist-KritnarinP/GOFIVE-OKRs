import { NINE_BOX_CELLS } from '../../constants/rubric.js';
import { JOB_LEVELS } from '../../constants/roles.js';

const CELL_STYLES = {
  high: {
    bg: 'var(--status-high-bg)',
    border: 'var(--status-high-border)',
    text: 'var(--status-high-text)',
  },
  track: {
    bg: 'var(--status-track-bg)',
    border: 'var(--status-track-border)',
    text: 'var(--status-track-text)',
  },
  warn: {
    bg: 'var(--status-warn-bg)',
    border: 'var(--status-warn-border)',
    text: 'var(--status-warn-text)',
  },
  low: {
    bg: 'var(--status-low-bg)',
    border: 'var(--status-low-border)',
    text: 'var(--status-low-text)',
  },
};

export function NineBoxGrid({ reviews, t, lang, onSelectReview }) {
  const grouped = new Map(NINE_BOX_CELLS.map((c) => [c.id, []]));
  for (const r of reviews) {
    if (r.nineBoxCell && grouped.has(r.nineBoxCell)) {
      grouped.get(r.nineBoxCell).push(r);
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.nineBoxTitle}</h2>
          <p className="text-sm text-[var(--ink-secondary)]">{t.nineBoxSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {NINE_BOX_CELLS.map((cell) => {
          const items = grouped.get(cell.id) || [];
          const palette = CELL_STYLES[cell.tone] || CELL_STYLES.track;
          return (
            <div
              key={cell.id}
              className="rounded-md border p-3.5 flex flex-col justify-between min-h-[124px] gap-2.5"
              style={{
                backgroundColor: items.length > 0 ? palette.bg : 'var(--surface-card)',
                borderColor: items.length > 0 ? palette.border : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    className="text-sm font-bold leading-snug"
                    style={{ color: items.length > 0 ? palette.text : 'var(--ink-primary)' }}
                  >
                    {lang === 'th' ? cell.labelTh : cell.label}
                  </h3>
                  <p className="text-xs text-[var(--ink-muted)] mt-0.5 tabular-nums">
                    {cell.xLabel} · {cell.yLabel}
                  </p>
                </div>
                <span
                  className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-md border text-sm font-bold tabular-nums bg-[var(--surface-card)]"
                  style={{ borderColor: palette.border, color: palette.text }}
                >
                  {items.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {items.map((rev) => {
                  const lvl = JOB_LEVELS.find((l) => l.id === rev.employee.jobLevel)?.short || 'L2';
                  return (
                    <button
                      key={rev.id}
                      type="button"
                      onClick={() => onSelectReview(rev)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] transition-colors duration-150 ease-out cursor-pointer tabular-nums"
                    >
                      <span className="text-[10px] font-bold px-1 rounded bg-[var(--surface-subtle)] text-[var(--ink-secondary)]">
                        {lvl}
                      </span>
                      <span>{lang === 'th' ? rev.employee.nameTh : rev.employee.name}</span>
                      <span className="text-[var(--ink-muted)]">({rev.overallScore?.toFixed(1)})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-muted)] pt-1 border-t border-[var(--border-subtle)]">
        <span>← {t.nineBoxXAxis}: Low (&lt;65%)</span>
        <span>Mid (65–89%)</span>
        <span>High (&gt;=90%) →</span>
      </div>
    </section>
  );
}
