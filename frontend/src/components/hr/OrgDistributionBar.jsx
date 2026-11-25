import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RUBRIC_LEVELS } from '../../constants/rubric.js';

export function OrgDistributionBar({ distribution, biasAlerts, t, lang }) {
  const maxPct = Math.max(25, ...distribution.map((d) => d.pct));

  return (
    <section className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4 space-y-3.5">
      <div>
        <h2 className="text-base font-bold text-(--ink-primary)">{t.distributionTitle}</h2>
        <p className="text-xs text-(--ink-secondary)">{t.distributionSubtitle}</p>
      </div>

      {/* Compact Pure HTML + Tailwind Distribution Bars */}
      <div className="space-y-1.5">
        {distribution.map((bucket) => {
          const rubric = RUBRIC_LEVELS[bucket.score - 1];
          const widthPct = Math.round((bucket.pct / maxPct) * 100);
          return (
            <div key={bucket.score} className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-5 text-xs font-semibold text-(--ink-primary) truncate">
                <span className="tabular-nums mr-1">{bucket.score}.0</span>
                <span className="text-[11px] font-normal text-(--ink-secondary)">
                  {lang === 'th' ? rubric.labelTh : rubric.label}
                </span>
              </div>
              <div className="col-span-4 h-3.5 rounded bg-(--surface-subtle) border border-(--border-subtle) overflow-hidden">
                <div
                  className="h-full transition-all duration-150 ease-out"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: bucket.score === 5 || bucket.score <= 2 ? 'var(--data-secondary)' : 'var(--brand-primary)',
                  }}
                />
              </div>
              <div className="col-span-3 text-right text-xs font-semibold text-(--ink-primary) tabular-nums">
                {bucket.count} ({bucket.pct}%)
              </div>
            </div>
          );
        })}
      </div>

      {/* Manager Bias Alerts */}
      <div className="pt-3 border-t border-(--border-subtle) space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-(--ink-secondary)">
          {t.biasAlertHeading}
        </h3>
        {biasAlerts.length === 0 ? (
          <div
            className="flex items-center gap-2 rounded-md border p-2.5 text-xs font-medium"
            style={{
              backgroundColor: 'var(--status-high-bg)',
              color: 'var(--status-high-text)',
              borderColor: 'var(--status-high-border)',
            }}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t.noBiasAlerts}</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {biasAlerts.map((alert) => (
              <div
                key={alert.managerId}
                className="flex items-start gap-2 rounded-md border p-2.5 text-xs"
                style={{
                  backgroundColor: 'var(--status-warn-bg)',
                  color: 'var(--status-warn-text)',
                  borderColor: 'var(--status-warn-border)',
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold">
                    {lang === 'th' ? alert.managerNameTh : alert.managerName} · {alert.department}
                  </p>
                  <p className="tabular-nums leading-snug">
                    {lang === 'th' ? alert.explanationTh : alert.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
