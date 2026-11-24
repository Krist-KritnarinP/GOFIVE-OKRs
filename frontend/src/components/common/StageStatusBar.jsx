import { useId, useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, Pencil, ShieldCheck } from 'lucide-react';
import { computeStageTimingClient } from '../../constants/initialData.js';

function formatShortDate(iso, lang) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

function toInputDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Parse YYYY-MM-DD at local noon to prevent UTC+7 midnight date shift
function parseLocalNoonIso(dateStr) {
  const [y, m, d] = String(dateStr || '').split('-').map(Number);
  if (!y || !m || !d) return new Date().toISOString();
  return new Date(y, m - 1, d, 12, 0, 0).toISOString();
}

function TimingChip({ timing, pendingCount = 0, t }) {
  if (pendingCount > 0 && timing?.state === 'OVERDUE') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold tabular-nums"
        style={{
          backgroundColor: 'var(--status-warn-bg)',
          color: 'var(--status-warn-text)',
          borderColor: 'var(--status-warn-border)',
        }}
      >
        <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
        {(t.stageClosedPending || 'Closed · {n} pending').replace('{n}', pendingCount)}
      </span>
    );
  }

  if (!timing) return null;

  if (timing.state === 'EARLY') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold tabular-nums"
        style={{
          backgroundColor: 'var(--status-high-bg)',
          color: 'var(--status-high-text)',
          borderColor: 'var(--status-high-border)',
        }}
      >
        <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
        {t.timingEarly.replace('{d}', timing.days)}
      </span>
    );
  }

  if (timing.state === 'ON_TIME') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold tabular-nums"
        style={{
          backgroundColor: 'var(--status-high-bg)',
          color: 'var(--status-high-text)',
          borderColor: 'var(--status-high-border)',
        }}
      >
        <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
        {t.timingOnTime}
      </span>
    );
  }

  if (timing.state === 'LATE_DONE') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold tabular-nums"
        style={{
          backgroundColor: 'var(--status-warn-bg)',
          color: 'var(--status-warn-text)',
          borderColor: 'var(--status-warn-border)',
        }}
      >
        <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
        {t.timingDoneLate.replace('{d}', timing.days)}
      </span>
    );
  }

  if (timing.state === 'COUNTDOWN') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold tabular-nums"
        style={{
          backgroundColor: 'var(--status-track-bg)',
          color: 'var(--status-track-text)',
          borderColor: 'var(--status-track-border)',
        }}
      >
        <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
        {timing.days === 0 ? t.timingDueToday : t.timingCountdown.replace('{d}', timing.days)}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold tabular-nums"
      style={{
        backgroundColor: 'var(--status-low-bg)',
        color: 'var(--status-low-text)',
        borderColor: 'var(--status-low-border)',
      }}
    >
      <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
      {t.timingOverdue.replace('{d}', timing.days)}
    </span>
  );
}

/**
 * Data-driven Status Strip showing:
 * - mode="cycle": 3 HR-configured Stage Due Dates with real pending counts from `reviews`
 * - mode="review": 4 Employee Lifecycle Stages with per-stage dates + Early / Countdown / Overdue chips
 */
export function StageStatusBar({
  mode = 'cycle',
  cycle,
  review = null,
  reviews = [],
  editable = false,
  onSaveDeadlines,
  t,
  lang,
}) {
  const baseId = useId();
  const [editing, setEditing] = useState(false);
  const [d1, setD1] = useState(() => toInputDate(cycle?.stage1DraftDeadline));
  const [d2, setD2] = useState(() => toInputDate(cycle?.stage2ApprovalDeadline));
  const [d3, setD3] = useState(() => toInputDate(cycle?.stage3HrAuditDeadline));

  // Real pending counts per cycle stage (fixes false "Done on time" when reviews are still stalled)
  const stage1Pending = reviews.filter((r) =>
    ['GOAL_DRAFT', 'GOAL_PENDING_APPROVAL', 'GOAL_REVISION_REQUIRED'].includes(r.status)
  ).length;
  const stage2Pending = reviews.filter((r) =>
    ['GOAL_APPROVED', 'SELF_REVIEW_SUBMITTED', 'REVIEW_REVISION_REQUIRED'].includes(r.status)
  ).length;
  const stage3Pending = reviews.filter((r) => r.status !== 'PUBLISHED').length;

  const stages =
    mode === 'review' && review
      ? [
          {
            id: 's1',
            label: t.empStepGoals,
            date: cycle?.stage1DraftDeadline,
            done: !['GOAL_DRAFT', 'GOAL_PENDING_APPROVAL', 'GOAL_REVISION_REQUIRED'].includes(review.status),
            active: ['GOAL_DRAFT', 'GOAL_PENDING_APPROVAL', 'GOAL_REVISION_REQUIRED'].includes(review.status),
            completedAt: review.goalsApprovedAt || review.goalsSubmittedAt,
            pendingCount: 0,
            accent: 'var(--status-track-accent)',
          },
          {
            id: 's2',
            label: t.empStepSelf,
            date: cycle?.selfDeadline,
            done: ['SELF_REVIEW_SUBMITTED', 'MANAGER_APPROVED', 'PUBLISHED'].includes(review.status),
            active: ['GOAL_APPROVED', 'REVIEW_REVISION_REQUIRED'].includes(review.status),
            completedAt: review.selfSubmittedAt,
            pendingCount: 0,
            accent: 'var(--status-track-accent)',
          },
          {
            id: 's3',
            label: t.empStepMgr,
            date: review.extendedDeadline || cycle?.stage2ApprovalDeadline,
            done: ['MANAGER_APPROVED', 'PUBLISHED'].includes(review.status),
            active: review.status === 'SELF_REVIEW_SUBMITTED',
            completedAt: review.managerSubmittedAt,
            pendingCount: 0,
            accent: 'var(--status-indigo-accent)',
          },
          {
            id: 's4',
            label: t.empStepPub,
            date: cycle?.stage3HrAuditDeadline,
            hrFixed: true,
            done: review.status === 'PUBLISHED',
            active: review.status === 'MANAGER_APPROVED',
            completedAt: review.publishedAt,
            pendingCount: 0,
            accent: 'var(--status-high-accent)',
          },
        ]
      : [
          {
            id: 'c1',
            label: t.stage1Label,
            sub: t.stage1Sub,
            date: cycle?.stage1DraftDeadline,
            done: reviews.length > 0 ? stage1Pending === 0 : new Date(cycle?.stage1DraftDeadline).getTime() < Date.now(),
            active: stage1Pending > 0,
            pendingCount: stage1Pending,
            accent: 'var(--status-track-accent)',
          },
          {
            id: 'c2',
            label: t.stage2Label,
            sub: t.stage2Sub,
            date: cycle?.stage2ApprovalDeadline,
            done: reviews.length > 0 ? stage1Pending === 0 && stage2Pending === 0 : new Date(cycle?.stage2ApprovalDeadline).getTime() < Date.now(),
            active: stage2Pending > 0,
            pendingCount: stage2Pending,
            accent: 'var(--status-indigo-accent)',
          },
          {
            id: 'c3',
            label: t.stage3Label,
            sub: t.stage3Sub,
            date: cycle?.stage3HrAuditDeadline,
            hrFixed: true,
            done: Boolean(cycle?.isLocked) || (reviews.length > 0 && stage3Pending === 0),
            active: !cycle?.isLocked && stage3Pending > 0,
            pendingCount: stage3Pending,
            accent: 'var(--status-high-accent)',
          },
        ];

  const completedCount = stages.filter((s) => s.done).length;

  const handleSave = (e) => {
    e.preventDefault();
    if (!onSaveDeadlines) return;
    onSaveDeadlines({
      stage1DraftDeadline: parseLocalNoonIso(d1),
      stage2ApprovalDeadline: parseLocalNoonIso(d2),
      stage3HrAuditDeadline: parseLocalNoonIso(d3),
    });
    setEditing(false);
  };

  return (
    <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden">
      {/* Data-Driven Segmented Status Track (1 segment per stage colored by actual status) */}
      <div className="grid gap-1 px-4 pt-3" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }} aria-hidden="true">
        {stages.map((stage) => {
          const timing = computeStageTimingClient({
            deadline: stage.date,
            completedAt: stage.done ? stage.completedAt || stage.date : null,
          });
          const barColor = stage.done
            ? 'var(--status-high-accent)'
            : timing?.state === 'OVERDUE'
              ? 'var(--status-warn-accent)'
              : stage.active
                ? 'var(--brand-primary)'
                : 'var(--border-subtle)';
          return (
            <div
              key={`seg-${stage.id}`}
              className="h-1.5 rounded-full transition-colors duration-150"
              style={{ backgroundColor: barColor }}
            />
          );
        })}
      </div>

      <div className="p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
            <h2 className="text-sm font-bold text-[var(--ink-primary)]">
              {mode === 'review' ? t.reviewProgressBarTitle : t.stageTimelineTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--ink-muted)] tabular-nums">
              {completedCount}/{stages.length} {t.stagesCompletedSuffix}
            </span>
            {editable && !editing && (
              <button
                type="button"
                onClick={() => {
                  setD1(toInputDate(cycle?.stage1DraftDeadline));
                  setD2(toInputDate(cycle?.stage2ApprovalDeadline));
                  setD3(toInputDate(cycle?.stage3HrAuditDeadline));
                  setEditing(true);
                }}
                className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] active:scale-[0.98] text-xs font-semibold text-[var(--ink-primary)] transition-[background-color,transform] duration-150 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                {t.editStageDatesBtn}
              </button>
            )}
          </div>
        </div>

        {/* Inline HR Stage Date Editor */}
        {editable && editing && (
          <form
            onSubmit={handleSave}
            className="rounded-md border border-[var(--status-track-border)] bg-[var(--status-track-bg)] p-3.5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            <div className="space-y-1">
              <label htmlFor={`${baseId}-s1`} className="block text-xs font-bold text-[var(--ink-primary)]">
                {t.stage1Label}
              </label>
              <input
                id={`${baseId}-s1`}
                type="date"
                required
                value={d1}
                onChange={(e) => setD1(e.target.value)}
                className="w-full min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-[var(--ink-primary)] tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`${baseId}-s2`} className="block text-xs font-bold text-[var(--ink-primary)]">
                {t.stage2Label}
              </label>
              <input
                id={`${baseId}-s2`}
                type="date"
                required
                value={d2}
                onChange={(e) => setD2(e.target.value)}
                className="w-full min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-[var(--ink-primary)] tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`${baseId}-s3`} className="block text-xs font-bold text-[var(--ink-primary)]">
                {t.stage3Label}
              </label>
              <input
                id={`${baseId}-s3`}
                type="date"
                required
                value={d3}
                onChange={(e) => setD3(e.target.value)}
                className="w-full min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-[var(--ink-primary)] tabular-nums"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="min-h-10 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="min-h-10 px-4 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-xs font-semibold text-white cursor-pointer"
              >
                {t.saveDatesBtn}
              </button>
            </div>
          </form>
        )}

        {/* Segmented Colored Stage Cards */}
        <ol
          className={`grid grid-cols-1 gap-3 ${
            stages.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'
          }`}
        >
          {stages.map((stage, idx) => {
            const timing = computeStageTimingClient({
              deadline: stage.date,
              completedAt: stage.done ? stage.completedAt || stage.date : null,
            });
            const isAttention = !stage.done && timing?.state === 'OVERDUE';

            const cardBorder = stage.done
              ? 'var(--status-high-border)'
              : isAttention
                ? 'var(--status-warn-border)'
                : stage.active
                  ? 'var(--status-track-border)'
                  : 'var(--border-subtle)';
            const cardBg = stage.done
              ? 'var(--status-high-tint)'
              : isAttention
                ? 'var(--status-warn-bg)'
                : stage.active
                  ? 'var(--status-track-tint)'
                  : 'var(--surface-subtle)';

            return (
              <li
                key={stage.id}
                aria-current={stage.active && !stage.done ? 'step' : undefined}
                className="rounded-md border p-3 flex flex-col justify-between gap-2 transition-colors duration-150"
                style={{
                  borderColor: cardBorder,
                  backgroundColor: cardBg,
                  borderTopWidth: '3px',
                  borderTopColor: stage.done
                    ? 'var(--status-high-accent)'
                    : isAttention
                      ? 'var(--status-warn-accent)'
                      : stage.active
                        ? stage.accent
                        : 'var(--border-strong)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {stage.done ? (
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        style={{ color: 'var(--status-high-text)' }}
                        aria-hidden="true"
                      />
                    ) : isAttention ? (
                      <AlertTriangle
                        className="w-4 h-4 shrink-0"
                        style={{ color: 'var(--status-warn-text)' }}
                        aria-hidden="true"
                      />
                    ) : stage.active ? (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 empeo-live-dot"
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[var(--border-strong)]" aria-hidden="true" />
                    )}
                    <span className="text-xs sm:text-sm font-bold text-[var(--ink-primary)] truncate">
                      {idx + 1}. {stage.label}
                    </span>
                  </div>

                  {stage.hrFixed && (
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                      style={{
                        backgroundColor: 'var(--status-indigo-bg)',
                        color: 'var(--status-indigo-text)',
                      }}
                    >
                      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                      {t.hrFixedBadge || 'HR Fixed'}
                    </span>
                  )}
                </div>

                {stage.sub && (
                  <p className="text-xs text-[var(--ink-secondary)] leading-snug">{stage.sub}</p>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-[var(--border-subtle)]/70">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)] tabular-nums">
                    {t.dueLabel}: {formatShortDate(stage.date, lang)}
                  </span>
                  <TimingChip timing={timing} pendingCount={stage.pendingCount} t={t} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
