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

const Y_TIERS = [
  {
    key: 'high',
    labelKey: 'nineBoxYHigh',
    rangeKey: 'nineBoxYHighRange',
    solid: 'var(--status-high-solid)',
    bg: 'var(--status-high-bg)',
    border: 'var(--status-high-border)',
    text: 'var(--status-high-text)',
  },
  {
    key: 'mid',
    labelKey: 'nineBoxYMid',
    rangeKey: 'nineBoxYMidRange',
    solid: 'var(--brand-primary)',
    bg: 'var(--status-track-bg)',
    border: 'var(--status-track-border)',
    text: 'var(--status-track-text)',
  },
  {
    key: 'low',
    labelKey: 'nineBoxYLow',
    rangeKey: 'nineBoxYLowRange',
    solid: 'var(--status-low-solid)',
    bg: 'var(--status-low-bg)',
    border: 'var(--status-low-border)',
    text: 'var(--status-low-text)',
  },
];

const X_TIERS = [
  {
    key: 'low',
    labelKey: 'nineBoxXLowLabel',
    rangeKey: 'nineBoxXLowRange',
    solid: 'var(--status-low-solid)',
    bg: 'var(--status-low-bg)',
    border: 'var(--status-low-border)',
    text: 'var(--status-low-text)',
  },
  {
    key: 'mid',
    labelKey: 'nineBoxXMidLabel',
    rangeKey: 'nineBoxXMidRange',
    solid: 'var(--brand-primary)',
    bg: 'var(--status-track-bg)',
    border: 'var(--status-track-border)',
    text: 'var(--status-track-text)',
  },
  {
    key: 'high',
    labelKey: 'nineBoxXHighLabel',
    rangeKey: 'nineBoxXHighRange',
    solid: 'var(--status-high-solid)',
    bg: 'var(--status-high-bg)',
    border: 'var(--status-high-border)',
    text: 'var(--status-high-text)',
  },
];

export function NineBoxGrid({ reviews, t, lang, onSelectReview }) {
  const grouped = new Map(NINE_BOX_CELLS.map((c) => [c.id, []]));
  for (const r of reviews) {
    if (r.nineBoxCell && grouped.has(r.nineBoxCell)) {
      grouped.get(r.nineBoxCell).push(r);
    }
  }

  const rows = [
    NINE_BOX_CELLS.slice(0, 3),
    NINE_BOX_CELLS.slice(3, 6),
    NINE_BOX_CELLS.slice(6, 9),
  ];

  return (
    <section className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-(--ink-primary)">{t.nineBoxTitle}</h2>
          <p className="text-sm text-(--ink-secondary)">{t.nineBoxSubtitle}</p>
        </div>
      </div>

      {/* Mobile Axis Legend (compact color bars for < md screens) */}
      <div className="md:hidden space-y-2 rounded-md border border-(--border-subtle) bg-(--surface-subtle) p-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-(--ink-primary)">↑ {t.nineBoxYAxis}:</span>
          {Y_TIERS.map((tier) => (
            <span
              key={tier.key}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-semibold tabular-nums"
              style={{ backgroundColor: tier.bg, borderColor: tier.border, color: tier.text }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.solid }} aria-hidden="true" />
              {t[tier.labelKey]} ({t[tier.rangeKey]})
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-(--ink-primary)">→ {t.nineBoxXAxis}:</span>
          {X_TIERS.map((tier) => (
            <span
              key={tier.key}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-semibold tabular-nums"
              style={{ backgroundColor: tier.bg, borderColor: tier.border, color: tier.text }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.solid }} aria-hidden="true" />
              {t[tier.labelKey]} ({t[tier.rangeKey]})
            </span>
          ))}
        </div>
      </div>

      {/* Desktop Y-Axis Header */}
      <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--ink-secondary)">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-(--surface-subtle) border border-(--border-subtle)">
          ↑ {t.nineBoxYAxis}
        </span>
      </div>

      {/* Matrix Rows: Left Color-Coded Y-Axis Bar + 3 Grid Cells */}
      <div className="space-y-3">
        {rows.map((rowCells, rowIdx) => {
          const yTier = Y_TIERS[rowIdx];
          return (
            <div key={yTier.key} className="grid grid-cols-1 md:grid-cols-[88px_1fr] gap-3 items-stretch">
              {/* Desktop Y-Axis Color Bar Cell */}
              <div
                className="hidden md:flex flex-col justify-center rounded-md border px-2.5 py-2 relative overflow-hidden"
                style={{
                  backgroundColor: yTier.bg,
                  borderColor: yTier.border,
                  borderLeftWidth: '4px',
                  borderLeftColor: yTier.solid,
                }}
              >
                <span className="text-xs font-bold leading-tight" style={{ color: yTier.text }}>
                  {t[yTier.labelKey]}
                </span>
                <span className="text-[11px] font-semibold mt-0.5 tabular-nums" style={{ color: yTier.text }}>
                  {t[yTier.rangeKey]}
                </span>
              </div>

              {/* 3 Performance Boxes in Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {rowCells.map((cell) => {
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
                          <p className="text-xs text-(--ink-muted) mt-0.5 tabular-nums md:hidden">
                            {lang === 'th' ? cell.xLabelTh : cell.xLabel} · {lang === 'th' ? cell.yLabelTh : cell.yLabel}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-md border text-sm font-bold tabular-nums bg-(--surface-card)"
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
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-xs font-semibold text-(--ink-primary) transition-colors duration-150 ease-out cursor-pointer tabular-nums"
                            >
                              <span className="text-[10px] font-bold px-1 rounded bg-(--surface-subtle) text-(--ink-secondary)">
                                {lvl}
                              </span>
                              <span>{lang === 'th' ? rev.employee.nameTh : rev.employee.name}</span>
                              <span className="text-(--ink-muted)">({rev.overallScore?.toFixed(1)})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Color-Coded X-Axis Bar (aligned directly under the 3 columns) */}
      <div className="hidden md:grid md:grid-cols-[88px_1fr] gap-3 items-start pt-1">
        <div />
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-3">
            {X_TIERS.map((xTier) => (
              <div
                key={xTier.key}
                className="rounded-md border px-3 py-2 flex items-center justify-between gap-2"
                style={{
                  backgroundColor: xTier.bg,
                  borderColor: xTier.border,
                  borderTopWidth: '4px',
                  borderTopColor: xTier.solid,
                }}
              >
                <span className="text-xs font-bold" style={{ color: xTier.text }}>
                  {t[xTier.labelKey]}
                </span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: xTier.text }}>
                  {t[xTier.rangeKey]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-(--surface-subtle) border border-(--border-subtle) text-xs font-bold uppercase tracking-wider text-(--ink-secondary)">
              {t.nineBoxXAxis} →
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
