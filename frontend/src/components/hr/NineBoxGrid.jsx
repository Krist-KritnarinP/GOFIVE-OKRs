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
    text: 'var(--status-high-text)',
  },
  {
    key: 'mid',
    labelKey: 'nineBoxYMid',
    rangeKey: 'nineBoxYMidRange',
    solid: 'var(--brand-primary)',
    text: 'var(--status-track-text)',
  },
  {
    key: 'low',
    labelKey: 'nineBoxYLow',
    rangeKey: 'nineBoxYLowRange',
    solid: 'var(--status-low-solid)',
    text: 'var(--status-low-text)',
  },
];

const X_TIERS = [
  {
    key: 'low',
    labelKey: 'nineBoxXLowLabel',
    rangeKey: 'nineBoxXLowRange',
    solid: 'var(--status-low-solid)',
    text: 'var(--status-low-text)',
  },
  {
    key: 'mid',
    labelKey: 'nineBoxXMidLabel',
    rangeKey: 'nineBoxXMidRange',
    solid: 'var(--brand-primary)',
    text: 'var(--status-track-text)',
  },
  {
    key: 'high',
    labelKey: 'nineBoxXHighLabel',
    rangeKey: 'nineBoxXHighRange',
    solid: 'var(--status-high-solid)',
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

      {/* Mobile Compact Color-Dot Scale Legend (< md) */}
      <div className="md:hidden space-y-1.5 text-xs text-(--ink-secondary)">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-(--ink-primary)">{t.nineBoxYAxis}:</span>
          {Y_TIERS.map((tier) => (
            <span key={tier.key} className="inline-flex items-center gap-1 font-semibold tabular-nums">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tier.solid }} aria-hidden="true" />
              <span style={{ color: tier.text }}>{t[tier.labelKey]}</span>
              <span className="text-(--ink-muted)">{t[tier.rangeKey]}</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-bold text-(--ink-primary)">{t.nineBoxXAxis}:</span>
          {X_TIERS.map((tier) => (
            <span key={tier.key} className="inline-flex items-center gap-1 font-semibold tabular-nums">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tier.solid }} aria-hidden="true" />
              <span style={{ color: tier.text }}>{t[tier.labelKey]}</span>
              <span className="text-(--ink-muted)">{t[tier.rangeKey]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Matrix + Sleek Borderless Color-Rail Scales */}
      <div className="md:grid md:grid-cols-[20px_72px_1fr] md:gap-x-3 md:items-stretch">
        {/* Vertical Rotated Y-Axis Title (Desktop only) */}
        <div className="hidden md:flex items-center justify-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-(--ink-muted) whitespace-nowrap [writing-mode:vertical-rl] rotate-180 select-none">
            {t.nineBoxYAxis} →
          </span>
        </div>

        {/* Left Borderless Y-Axis Color Rail (3 aligned tier segments) */}
        <div className="hidden md:grid md:grid-rows-3 gap-3">
          {Y_TIERS.map((yTier) => (
            <div key={yTier.key} className="flex items-center justify-end gap-2.5 py-1">
              <div className="text-right leading-tight">
                <p className="text-xs font-bold" style={{ color: yTier.text }}>
                  {t[yTier.labelKey]}
                </p>
                <p className="text-[11px] font-medium text-(--ink-muted) tabular-nums mt-0.5">
                  {t[yTier.rangeKey]}
                </p>
              </div>
              <div
                className="w-1.5 h-full rounded-full shrink-0"
                style={{ backgroundColor: yTier.solid }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        {/* 3x3 Performance Grid Cards */}
        <div className="space-y-3">
          {rows.map((rowCells, rowIdx) => (
            <div key={Y_TIERS[rowIdx].key} className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          ))}
        </div>

        {/* Bottom Borderless X-Axis Color Rail (aligned strictly under the 3 columns) */}
        <div className="hidden md:block" />
        <div className="hidden md:block" />
        <div className="hidden md:block pt-3 space-y-2">
          <div className="grid grid-cols-3 gap-3">
            {X_TIERS.map((xTier) => (
              <div key={xTier.key} className="space-y-1.5">
                <div
                  className="h-1.5 w-full rounded-full"
                  style={{ backgroundColor: xTier.solid }}
                  aria-hidden="true"
                />
                <div className="flex items-baseline justify-center gap-1.5 text-center tabular-nums">
                  <span className="text-xs font-bold" style={{ color: xTier.text }}>
                    {t[xTier.labelKey]}
                  </span>
                  <span className="text-[11px] font-medium text-(--ink-muted)">
                    {t[xTier.rangeKey]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-(--ink-muted) pt-0.5 select-none">
            {t.nineBoxXAxis} →
          </p>
        </div>
      </div>
    </section>
  );
}
