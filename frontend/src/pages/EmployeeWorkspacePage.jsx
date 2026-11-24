import { useState } from 'react';
import { AlertCircle, Lock, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { EMPLOYEE_DEMO_SWITCHES } from '../constants/roles.js';
import { COMPETENCIES, NINE_BOX_CELLS } from '../constants/rubric.js';
import { filterActivityLogsForRole } from '../constants/initialData.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { JobLevelBadge } from '../components/common/JobLevelBadge.jsx';
import { StageStatusBar } from '../components/common/StageStatusBar.jsx';
import { CommentHistoryPanel } from '../components/common/CommentHistoryPanel.jsx';
import { ActivityLogPanel } from '../components/common/ActivityLogPanel.jsx';
import { GoalEditorModal } from '../components/employee/GoalEditorModal.jsx';

const EMPLOYEE_SAFE_ACTIONS = new Set([
  'GOAL_SUBMITTED',
  'GOAL_APPROVED',
  'GOAL_REVISION_REQUESTED',
  'SELF_REVIEW_SUBMITTED',
  'REVIEW_REVISION_REQUESTED',
  'HRBP_ADVISOR_COMMENT',
  'PUBLISHED',
]);

export function EmployeeWorkspacePage({
  cycle,
  reviews,
  auditLogs,
  activeEmployeeId,
  onSelectEmployee,
  t,
  lang,
  onSubmitGoals,
  onSubmitSelfReview,
}) {
  const review = reviews.find((r) => r.employeeId === activeEmployeeId) || reviews[0];
  const canEditGoals = ['GOAL_DRAFT', 'GOAL_REVISION_REQUIRED'].includes(review.status);
  const canFillSelfReview = ['GOAL_APPROVED', 'REVIEW_REVISION_REQUIRED'].includes(review.status);

  const [draftGoals, setDraftGoals] = useState(() => review.goals || []);
  const [goalNote, setGoalNote] = useState('');
  const [goalModal, setGoalModal] = useState({ open: false, goal: null });

  const [reflection, setReflection] = useState(review.selfPayload?.reflection || '');
  const [goalInputs, setGoalInputs] = useState(() =>
    Object.fromEntries(
      (review.goals || []).map((g) => {
        const existing = review.selfPayload?.goalAssessments?.find((a) => a.goalId === g.id);
        return [
          g.id,
          {
            actualValue: g.actualValue || '',
            progressPct: g.progressPct ?? 0,
            selfScore: existing?.selfScore ?? 3,
            selfEvidence: existing?.selfEvidence ?? '',
          },
        ];
      })
    )
  );

  const displayedGoals = canEditGoals ? draftGoals : review.goals || [];
  const totalWeight = displayedGoals.reduce((acc, g) => acc + Number(g.weight || 0), 0);
  const cellInfo = NINE_BOX_CELLS.find((c) => c.id === review.nineBoxCell);

  // Strict privacy filter: unpublished internal manager/HR comments never shown to employee
  const safeCommentHistory =
    review.status === 'PUBLISHED'
      ? review.commentHistory || []
      : (review.commentHistory || []).filter((c) => EMPLOYEE_SAFE_ACTIONS.has(c.action));

  const employeeLogs = filterActivityLogsForRole(auditLogs, {
    role: 'EMPLOYEE',
    userId: review.employeeId,
  });

  const handleSaveModalGoal = (goalObj) => {
    setDraftGoals((prev) => {
      const exists = prev.some((g) => g.id === goalObj.id);
      return exists ? prev.map((g) => (g.id === goalObj.id ? goalObj : g)) : [...prev, goalObj];
    });
  };

  const handleDeleteGoal = (goalId) => {
    setDraftGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleSubmitGoalsClick = () => {
    if (totalWeight !== 100 || draftGoals.length === 0) return;
    onSubmitGoals(review.id, draftGoals, goalNote);
    setGoalNote('');
  };

  const handleSubmitSelf = (e) => {
    e.preventDefault();
    const updatedGoals = (review.goals || []).map((g) => ({
      ...g,
      actualValue: goalInputs[g.id]?.actualValue ?? g.actualValue,
      progressPct: Number(goalInputs[g.id]?.progressPct ?? g.progressPct),
    }));
    onSubmitSelfReview(
      review.id,
      {
        goalAssessments: updatedGoals.map((g) => ({
          goalId: g.id,
          actualValue: g.actualValue,
          progressPct: g.progressPct,
          selfScore: Number(goalInputs[g.id]?.selfScore ?? 3),
          selfEvidence: goalInputs[g.id]?.selfEvidence ?? '',
        })),
        competencyAssessments: COMPETENCIES.map((c) => ({
          competencyId: c.id,
          selfScore: 3,
          selfNote: '',
        })),
        reflection,
      },
      updatedGoals
    );
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
              {t.empTitle}
            </h1>
            <JobLevelBadge level={review.employee.jobLevel} lang={lang} />
          </div>
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

      {/* Tasteful Colorful 4-Stage Status Bar with Dates + Countdown / Overdue / Done Early Chips */}
      <StageStatusBar mode="review" cycle={cycle} review={review} t={t} lang={lang} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left (7 cols): OKR Builder (Phase A) OR Self-Assessment (Phase B) + Ping-Pong History */}
        <div className="xl:col-span-7 space-y-5">
          <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.empGoalsTitle}</h2>
                <StatusBadge
                  tone={
                    review.status === 'PUBLISHED'
                      ? 'high'
                      : review.status === 'MANAGER_APPROVED'
                        ? 'indigo'
                        : ['GOAL_REVISION_REQUIRED', 'REVIEW_REVISION_REQUIRED'].includes(review.status) || review.isOverdue
                          ? 'warn'
                          : 'track'
                  }
                >
                  {t.status[review.status]}
                </StatusBadge>
              </div>

              {canEditGoals && (
                <button
                  type="button"
                  onClick={() => setGoalModal({ open: true, goal: null })}
                  className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>{t.addGoalBtn}</span>
                </button>
              )}
            </div>

            {/* Ping-Pong >= 2 Calm 1-on-1 Alignment Recommendation */}
            {canEditGoals && (review.revisionRound || 1) >= 2 && (
              <div
                className="rounded-md border p-3.5 flex items-start gap-2.5 text-xs sm:text-sm"
                style={{
                  backgroundColor: 'var(--status-indigo-bg)',
                  borderColor: 'var(--status-indigo-border)',
                  color: 'var(--status-indigo-text)',
                }}
              >
                <Users className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="font-medium">
                  {t.pingPongBannerText.replace('{r}', review.revisionRound)}
                </p>
              </div>
            )}

            {/* Live Weight Counter Bar during OKR Setting */}
            {canEditGoals && (
              <div
                className="rounded-md border p-3 flex items-center justify-between gap-3 text-sm font-semibold tabular-nums"
                style={
                  totalWeight === 100
                    ? {
                        backgroundColor: 'var(--status-high-bg)',
                        color: 'var(--status-high-text)',
                        borderColor: 'var(--status-high-border)',
                      }
                    : {
                        backgroundColor: 'var(--status-warn-bg)',
                        color: 'var(--status-warn-text)',
                        borderColor: 'var(--status-warn-border)',
                      }
                }
              >
                <span>
                  {t.totalWeightLabel}: {totalWeight}% / 100%
                </span>
                {totalWeight !== 100 && (
                  <span className="inline-flex items-center gap-1 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.weightMustBe100}
                  </span>
                )}
              </div>
            )}

            {/* OKR Cards or Welcoming 0-OKR Empty State */}
            <form onSubmit={handleSubmitSelf} className="space-y-4">
              {displayedGoals.length === 0 ? (
                <div className="rounded-md border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] p-6 text-center space-y-3">
                  <p className="text-base font-bold text-[var(--ink-primary)]">{t.emptyOkrsTitle}</p>
                  <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto">{t.emptyOkrsDesc}</p>
                  {canEditGoals && (
                    <button
                      type="button"
                      onClick={() => setGoalModal({ open: true, goal: null })}
                      className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] active:scale-[0.98] text-sm font-semibold text-white transition-[background-color,transform] duration-150 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>{t.addGoalBtn}</span>
                    </button>
                  )}
                </div>
              ) : (
              <div className="space-y-3">
                {displayedGoals.map((goal) => {
                  const input = goalInputs[goal.id] || {
                    actualValue: goal.actualValue || '',
                    progressPct: goal.progressPct ?? 0,
                    selfScore: 3,
                    selfEvidence: '',
                  };
                  const metricLabel = t.metricTypes?.[goal.metricType] || goal.metricType || 'QUANTITATIVE';

                  return (
                    <div
                      key={goal.id}
                      className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[var(--ink-primary)]">
                            {lang === 'th' ? goal.titleTh : goal.title}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-[var(--ink-secondary)] tabular-nums">
                            <span className="px-2 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] font-semibold">
                              {metricLabel}
                            </span>
                            <span>{t.targetLabel}: <strong>{goal.targetValue || goal.metric} {goal.unit || ''}</strong></span>
                            <span>{t.weightLabel}: <strong>{goal.weight}%</strong></span>
                            <span>{t.multiplierLabel}: <strong>{goal.multiplier || 1.0}x</strong></span>
                            <span>{t.hitDateLabel}: <strong>{goal.dueDate || '—'}</strong></span>
                          </div>
                        </div>

                        {canEditGoals ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setGoalModal({ open: true, goal })}
                              className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                              {t.editGoalBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border text-xs font-semibold cursor-pointer"
                              style={{
                                backgroundColor: 'var(--status-low-bg)',
                                color: 'var(--status-low-text)',
                                borderColor: 'var(--status-low-border)',
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              {t.deleteGoalBtn}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-[var(--ink-primary)] tabular-nums shrink-0">
                            {goal.progressPct}%
                          </span>
                        )}
                      </div>

                      {!canEditGoals && (
                        <div className="h-2 w-full rounded bg-[var(--border-subtle)] overflow-hidden">
                          <div
                            className="h-full"
                            style={{ width: `${goal.progressPct}%`, backgroundColor: 'var(--brand-primary)' }}
                          />
                        </div>
                      )}

                      {canFillSelfReview ? (
                        <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-[var(--ink-primary)]">
                                {t.actualAchievedLabel}
                              </label>
                              <input
                                type="text"
                                required
                                value={input.actualValue}
                                onChange={(e) =>
                                  setGoalInputs((p) => ({
                                    ...p,
                                    [goal.id]: { ...input, actualValue: e.target.value },
                                  }))
                                }
                                placeholder="e.g. 92%"
                                className="w-full min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm text-[var(--ink-primary)]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-[var(--ink-primary)]">
                                {t.progressPctLabel}
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                required
                                value={input.progressPct}
                                onChange={(e) =>
                                  setGoalInputs((p) => ({
                                    ...p,
                                    [goal.id]: { ...input, progressPct: e.target.value },
                                  }))
                                }
                                className="w-full min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm text-[var(--ink-primary)] tabular-nums"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-[var(--ink-primary)]">
                                {t.selfScoreLabel}
                              </label>
                              <select
                                value={input.selfScore}
                                onChange={(e) =>
                                  setGoalInputs((p) => ({
                                    ...p,
                                    [goal.id]: { ...input, selfScore: Number(e.target.value) },
                                  }))
                                }
                                className="w-full min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-[var(--ink-primary)] tabular-nums"
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <option key={n} value={n}>
                                    {n} / 5
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            required
                            value={input.selfEvidence}
                            onChange={(e) =>
                              setGoalInputs((p) => ({
                                ...p,
                                [goal.id]: { ...input, selfEvidence: e.target.value },
                              }))
                            }
                            placeholder={t.drawerEvidenceLabel}
                            className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                          />
                        </div>
                      ) : (
                        input.selfEvidence && (
                          <p className="text-xs text-[var(--ink-secondary)]">
                            {goal.actualValue && <strong>{t.actualLabel}: {goal.actualValue} · </strong>}
                            &ldquo;{input.selfEvidence}&rdquo;
                          </p>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
              )}

              {canEditGoals && (
                <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                  <textarea
                    rows={2}
                    value={goalNote}
                    onChange={(e) => setGoalNote(e.target.value)}
                    placeholder={t.goalNotePlaceholder}
                    className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={totalWeight !== 100 || draftGoals.length === 0}
                      onClick={handleSubmitGoalsClick}
                      className="min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)] text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed"
                    >
                      {review.status === 'GOAL_REVISION_REQUIRED' ? t.resubmitGoalsBtn : t.submitGoalsBtn}
                    </button>
                  </div>
                </div>
              )}

              {canFillSelfReview && (
                <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                      {t.empReflectionLabel}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white cursor-pointer"
                    >
                      {t.empSubmitSelf}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </section>

          <CommentHistoryPanel history={safeCommentHistory} t={t} />
        </div>

        {/* Right (5 cols): Locked vs Published Result + Own-Review Private Activity Log */}
        <div className="xl:col-span-5 space-y-5">
          <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
            {review.status !== 'PUBLISHED' ? (
              <div className="flex flex-col items-start justify-center space-y-3 py-4">
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

          <ActivityLogPanel logs={employeeLogs} role="EMPLOYEE" t={t} />
        </div>
      </div>

      {goalModal.open && (
        <GoalEditorModal
          key={goalModal.goal?.id || 'new-goal'}
          isOpen={goalModal.open}
          initialGoal={goalModal.goal}
          t={t}
          onClose={() => setGoalModal({ open: false, goal: null })}
          onSave={handleSaveModalGoal}
        />
      )}
    </div>
  );
}
