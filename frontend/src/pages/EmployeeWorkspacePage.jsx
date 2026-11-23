import { useState } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { EMPLOYEE_DEMO_SWITCHES } from '../constants/roles.js';
import { COMPETENCIES, NINE_BOX_CELLS } from '../constants/rubric.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';

export function EmployeeWorkspacePage({
  reviews,
  activeEmployeeId,
  onSelectEmployee,
  t,
  lang,
  onSubmitSelfReview,
}) {
  const review = reviews.find((r) => r.employeeId === activeEmployeeId) || reviews[0];
  const [reflection, setReflection] = useState(review.selfPayload?.reflection || '');
  const [goalNotes, setGoalNotes] = useState(() =>
    Object.fromEntries(
      review.goals.map((g) => {
        const existing = review.selfPayload?.goalAssessments?.find((a) => a.goalId === g.id);
        return [g.id, { score: existing?.selfScore ?? 3, evidence: existing?.selfEvidence ?? '' }];
      })
    )
  );

  const steps = [
    { label: t.empStep1, done: true },
    { label: t.empStep2, done: review.status !== 'DRAFT' },
    { label: t.empStep3, done: review.status === 'READY_FOR_RELEASE' || review.status === 'PUBLISHED' },
    { label: t.empStep4, done: review.status === 'PUBLISHED' },
  ];

  const cellInfo = NINE_BOX_CELLS.find((c) => c.id === review.nineBoxCell);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitSelfReview(review.id, {
      goalAssessments: review.goals.map((g) => ({
        goalId: g.id,
        selfScore: goalNotes[g.id]?.score ?? 3,
        selfEvidence: goalNotes[g.id]?.evidence ?? '',
      })),
      competencyAssessments: COMPETENCIES.map((c) => ({
        competencyId: c.id,
        selfScore: 3,
        selfNote: '',
      })),
      reflection,
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
            {t.empTitle}
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-secondary)] mt-0.5">{t.empSubtitle}</p>
        </div>

        {/* Employee Persona Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase text-[var(--ink-muted)]">
            {t.empSwitchLabel}:
          </span>
          {EMPLOYEE_DEMO_SWITCHES.map((emp) => {
            const active = emp.userId === activeEmployeeId;
            return (
              <button
                key={emp.userId}
                type="button"
                onClick={() => onSelectEmployee(emp.userId)}
                className={`min-h-10 px-3 rounded-md border text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                  active
                    ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                    : 'bg-[var(--surface-card)] border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {lang === 'th' ? emp.nameTh : emp.name} · {lang === 'th' ? emp.tagTh : emp.tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Step Lifecycle Stepper */}
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
        <ol className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, idx) => (
            <li
              key={step.label}
              className="flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm font-semibold"
              style={
                step.done
                  ? {
                      backgroundColor: 'var(--status-high-bg)',
                      color: 'var(--status-high-text)',
                      borderColor: 'var(--status-high-border)',
                    }
                  : {
                      backgroundColor: 'var(--surface-subtle)',
                      color: 'var(--ink-secondary)',
                      borderColor: 'var(--border-subtle)',
                    }
              }
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">
                {idx + 1}. {step.label}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Goals & Self-Review */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.empGoalsTitle}</h2>
            <StatusBadge tone={review.isOverdue ? 'warn' : review.status === 'PUBLISHED' ? 'high' : 'track'}>
              {t.status[review.status]}
            </StatusBadge>
          </div>

          <div className="space-y-3">
            {review.goals.map((goal) => {
              const entry = goalNotes[goal.id] || { score: 3, evidence: '' };
              return (
                <div
                  key={goal.id}
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--ink-primary)]">
                        {lang === 'th' ? goal.titleTh : goal.title}
                      </p>
                      <p className="text-xs text-[var(--ink-muted)] tabular-nums">
                        KPI: {goal.metric} · Weight {goal.weight}%
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[var(--ink-primary)] tabular-nums">
                      {goal.progressPct}%
                    </span>
                  </div>

                  {/* Pure HTML Progress Bar */}
                  <div className="h-2 w-full rounded bg-[var(--border-subtle)] overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${goal.progressPct}%`,
                        backgroundColor: 'var(--brand-primary)',
                      }}
                    />
                  </div>

                  {review.status === 'DRAFT' ? (
                    <textarea
                      rows={2}
                      value={entry.evidence}
                      onChange={(e) =>
                        setGoalNotes((prev) => ({
                          ...prev,
                          [goal.id]: { ...entry, evidence: e.target.value },
                        }))
                      }
                      placeholder={t.drawerEvidenceLabel}
                      className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                    />
                  ) : (
                    entry.evidence && (
                      <p className="text-xs text-[var(--ink-secondary)]">&ldquo;{entry.evidence}&rdquo;</p>
                    )
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[var(--ink-primary)]">
              {t.empReflectionLabel}
            </label>
            <textarea
              rows={3}
              disabled={review.status !== 'DRAFT'}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-secondary)]"
            />
          </div>

          {review.status === 'DRAFT' && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white transition-colors duration-150 cursor-pointer"
              >
                {t.empSubmitSelf}
              </button>
            </div>
          )}
        </form>

        {/* Right: Locked vs Published Result Panel */}
        <section className="xl:col-span-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
          {review.status !== 'PUBLISHED' ? (
            <div className="h-full flex flex-col items-start justify-center space-y-3 py-6">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-[var(--border-strong)] bg-[var(--surface-subtle)] text-[var(--ink-primary)]">
                <Lock className="w-5 h-5" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-bold text-[var(--ink-primary)]">
                {t.empResultsLockedTitle}
              </h2>
              <p className="text-sm text-[var(--ink-secondary)]">{t.empResultsLockedDesc}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--ink-primary)]">
                {t.empResultsPublishedTitle}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3.5">
                  <p className="text-xs font-semibold text-[var(--ink-secondary)]">{t.empOverallScore}</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--ink-primary)] tabular-nums">
                    {review.overallScore?.toFixed(2)} / 5.0
                  </p>
                </div>
                <div
                  className="rounded-md border p-3.5"
                  style={{
                    backgroundColor: 'var(--status-high-bg)',
                    borderColor: 'var(--status-high-border)',
                    color: 'var(--status-high-text)',
                  }}
                >
                  <p className="text-xs font-semibold">{t.empNineBoxTier}</p>
                  <p className="mt-1 text-sm font-bold">
                    {cellInfo ? (lang === 'th' ? cellInfo.labelTh : cellInfo.label) : '—'}
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border-subtle)] p-3">
                  <p className="text-xs text-[var(--ink-secondary)]">{t.empWhatScore}</p>
                  <p className="mt-0.5 text-lg font-bold text-[var(--ink-primary)] tabular-nums">
                    {review.whatPct?.toFixed(0)}% ({review.whatScore?.toFixed(1)}/5)
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border-subtle)] p-3">
                  <p className="text-xs text-[var(--ink-secondary)]">{t.empHowScore}</p>
                  <p className="mt-0.5 text-lg font-bold text-[var(--ink-primary)] tabular-nums">
                    {review.howScore?.toFixed(2)} / 5.0
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <h3 className="text-sm font-bold text-[var(--ink-primary)]">{t.empManagerFeedback}</h3>
                <p className="text-sm text-[var(--ink-secondary)]">
                  {review.managerPayload?.managerSummary}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[var(--ink-primary)]">{t.empDevFocus}</h3>
                <p className="text-sm text-[var(--ink-secondary)]">
                  {review.managerPayload?.developmentFocus}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
