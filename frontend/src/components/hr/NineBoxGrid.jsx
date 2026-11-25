import { NINE_BOX_CELLS } from '../../constants/rubric.js';
import { JOB_LEVELS } from '../../constants/roles.js';

/**
 * Diagonal 9-Box heat-map palette:
 * Progresses clearly from bottom-left (Needs Action / coral-rose)
 * through middle zones (amber / slate / sky)
 * up to top-right (Star / High Performer / rich emerald).
 * All pairs meet WCAG AA contrast for text on tinted backgrounds.
 */
const CELL_HEATMAP = {
  // Row 0 — High Competency (>= 4.0)
  HIGH_POTENTIAL_EMERGING: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    activeBorder: '#60A5FA',
    text: '#1E40AF',
    accent: '#2563EB',
  },
  HIGH_IMPACT_GROWTH: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    activeBorder: '#34D399',
    text: '#047857',
    accent: '#10B981',
  },
  STAR_HIGH_PERFORMER: {
    bg: '#D1FAE5',
    border: '#6EE7B7',
    activeBorder: '#059669',
    text: '#065F46',
    accent: '#059669',
  },
  // Row 1 — Mid Competency (2.6–3.9)
  DEVELOPING_TALENT: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    activeBorder: '#F59E0B',
    text: '#B45309',
    accent: '#D97706',
  },
  CORE_PERFORMER: {
    bg: '#F1F5F9',
    border: '#CBD5E1',
    activeBorder: '#64748B',
    text: '#334155',
    accent: '#475569',
  },
  CONSISTENT_CONTRIBUTOR: {
    bg: '#F0FDFA',
    border: '#99F6E4',
    activeBorder: '#14B8A6',
    text: '#0F766E',
    accent: '#0D9488',
  },
  // Row 2 — Low Competency (< 2.6)
  NEEDS_ACTION_LOW_PERFORMER: {
    bg: '#FFE4E6',
    border: '#FDA4AF',
    activeBorder: '#E11D48',
    text: '#9F1239',
    accent: '#E11D48',
  },
  INCONSISTENT_PERFORMER: {
    bg: '#FFF1F2',
    border: '#FECDD3',
    activeBorder: '#FB7185',
    text: '#BE123C',
    accent: '#F43F5E',
  },
  EFFECTIVE_SPECIALIST: {
    bg: '#FEF3C7',
    border: '#FCD34D',
    activeBorder: '#D97706',
    text: '#92400E',
    accent: '#D97706',
  },
};

const Y_TIERS = [
  { key: 'high', labelKey: 'nineBoxYHigh', rangeKey: 'nineBoxYHighRange', solid: '#059669', text: '#065F46' },
  { key: 'mid', labelKey: 'nineBoxYMid', rangeKey: 'nineBoxYMidRange', solid: '#2563EB', text: '#1E40AF' },
  { key: 'low', labelKey: 'nineBoxYLow', rangeKey: 'nineBoxYLowRange', solid: '#E11D48', text: '#9F1239' },
];

const X_TIERS = [
  { key: 'low', labelKey: 'nineBoxXLowLabel', rangeKey: 'nineBoxXLowRange', solid: '#E11D48', text: '#9F1239' },
  { key: 'mid', labelKey: 'nineBoxXMidLabel', rangeKey: 'nineBoxXMidRange', solid: '#2563EB', text: '#1E40AF' },
  { key: 'high', labelKey: 'nineBoxXHighLabel', rangeKey: 'nineBoxXHighRange', solid: '#059669', text: '#065F46' },
];

const SPECTRUM_DOTS = ['#E11D48', '#F59E0B', '#64748B', '#10B981', '#059669'];

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
      {/* Header + Diagonal Heat-Map Scale Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-(--ink-primary)">{t.nineBoxTitle}</h2>
          <p className="text-sm text-(--ink-secondary)">{t.nineBoxSubtitle}</p>
        </div>
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--ink-muted) shrink-0"
          aria-hidden="true"
        >
          <span>{t.nineBoxYLow}</span>
          <span className="inline-flex items-center gap-1">
            {SPECTRUM_DOTS.map((color) => (
              <span
                key={color}
                className="w-3 h-3 rounded-xs"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
          <span>{t.nineBoxYHigh} ↗</span>
        </div>
      </div>

      {/* Compact Mobile Scale Legend (< md) */}
      <div className="md:hidden flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--ink-secondary)">
        <span className="font-bold text-(--ink-primary)">↑ {t.nineBoxYAxis}</span>
        <span className="font-bold text-(--ink-primary)">→ {t.nineBoxXAxis}</span>
      </div>

      {/* Spacious Matrix + Sleek Borderless Color Rails */}
      <div className="md:grid md:grid-cols-[18px_66px_1fr] md:gap-x-3 md:items-stretch">
        {/* Vertical Rotated Y-Axis Title */}
        <div className="hidden md:flex items-center justify-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-(--ink-muted) whitespace-nowrap [writing-mode:vertical-rl] rotate-180 select-none">
            {t.nineBoxYAxis} →
          </span>
        </div>

        {/* Left Borderless Y-Axis Color Rail */}
        <div className="hidden md:grid md:grid-rows-3 gap-2.5">
          {Y_TIERS.map((yTier) => (
            <div key={yTier.key} className="flex items-center justify-end gap-2 py-1">
              <div className="text-right leading-tight">
                <p className="text-xs font-bold" style={{ color: yTier.text }}>
                  {t[yTier.labelKey]}
                </p>
                <p className="text-[11px] font-medium text-(--ink-muted) tabular-nums">
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

        {/* Spacious 3x3 Diagonal Heat-Map Grid */}
        <div className="space-y-2.5">
          {rows.map((rowCells, rowIdx) => (
            <div key={Y_TIERS[rowIdx].key} className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {rowCells.map((cell) => {
                const items = grouped.get(cell.id) || [];
                const hm = CELL_HEATMAP[cell.id] || CELL_HEATMAP.CORE_PERFORMER;
                const hasItems = items.length > 0;
                return (
                  <div
                    key={cell.id}
                    className="rounded-md border p-3.5 flex flex-col justify-between min-h-[116px] gap-2.5 transition-colors duration-150"
                    style={{
                      backgroundColor: hm.bg,
                      borderLeftColor: hasItems ? hm.activeBorder : hm.border,
                      borderRightColor: hasItems ? hm.activeBorder : hm.border,
                      borderBottomColor: hasItems ? hm.activeBorder : hm.border,
                      borderTopWidth: '3px',
                      borderTopColor: hm.accent,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="text-sm font-bold leading-snug"
                          style={{ color: hm.text }}
                        >
                          {lang === 'th' ? cell.labelTh : cell.label}
                        </h3>
                        <p className="text-xs text-(--ink-muted) mt-0.5 tabular-nums md:hidden">
                          {lang === 'th' ? cell.xLabelTh : cell.xLabel} · {lang === 'th' ? cell.yLabelTh : cell.yLabel}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded text-xs font-bold tabular-nums shrink-0"
                        style={{
                          backgroundColor: hasItems ? hm.accent : 'rgba(255,255,255,0.8)',
                          color: hasItems ? '#FFFFFF' : hm.text,
                          border: hasItems ? 'none' : `1px solid ${hm.border}`,
                        }}
                      >
                        {items.length}
                      </span>
                    </div>

                    {hasItems && (
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((rev) => {
                          const lvl = JOB_LEVELS.find((l) => l.id === rev.employee.jobLevel)?.short || 'L2';
                          return (
                            <button
                              key={rev.id}
                              type="button"
                              onClick={() => onSelectReview(rev)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-xs font-semibold text-(--ink-primary) shadow-2xs transition-colors duration-150 ease-out cursor-pointer tabular-nums"
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
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Borderless X-Axis Color Rail */}
        <div className="hidden md:block" />
        <div className="hidden md:block" />
        <div className="hidden md:block pt-2.5 space-y-1.5">
          <div className="grid grid-cols-3 gap-2.5">
            {X_TIERS.map((xTier) => (
              <div key={xTier.key} className="space-y-1">
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
          <p className="text-center text-[11px] font-bold uppercase tracking-wider text-(--ink-muted) select-none">
            {t.nineBoxXAxis} →
          </p>
        </div>
      </div>
    </section>
  );
}
