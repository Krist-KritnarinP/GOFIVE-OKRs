import { useId, useRef, useState } from 'react';
import { AlertCircle, Lock, RotateCcw, X } from 'lucide-react';
import { COMPETENCIES, RUBRIC_LEVELS } from '../../constants/rubric.js';
import { ModalDialog } from '../common/ModalDialog.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { JobLevelBadge } from '../common/JobLevelBadge.jsx';
import { CommentHistoryPanel } from '../common/CommentHistoryPanel.jsx';
import { ReturnFeedbackCard } from '../common/ReturnFeedbackCard.jsx';

function buildInitialForm(review) {
  const goalRatings = review.goals.map((g) => {
    const existing = review.managerPayload?.goalRatings?.find((r) => r.goalId === g.id);
    return {
      goalId: g.id,
      score: existing?.score ?? 3,
      evidence: existing?.evidence ?? '',
    };
  });

  const competencyRatings = COMPETENCIES.map((c) => {
    const existing = review.managerPayload?.competencyRatings?.find((r) => r.competencyId === c.id);
    return {
      competencyId: c.id,
      score: existing?.score ?? 3,
      evidence: existing?.evidence ?? '',
    };
  });

  return {
    goalRatings,
    competencyRatings,
    managerSummary: review.managerPayload?.managerSummary ?? '',
    developmentFocus: review.managerPayload?.developmentFocus ?? '',
  };
}

export function EvaluationDrawer({
  review,
  readOnly = false,
  t,
  lang,
  onClose,
  onSave,
  onReturnToEmployee,
  onHrReturnToManager,
}) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const returnInputRef = useRef(null);
  const [form, setForm] = useState(() => buildInitialForm(review));
  const [returnNote, setReturnNote] = useState('');
  const [showReturnBox, setShowReturnBox] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const updateGoal = (goalId, patch) => {
    setErrorMsg('');
    setForm((prev) => ({
      ...prev,
      goalRatings: prev.goalRatings.map((item) =>
        item.goalId === goalId ? { ...item, ...patch } : item
      ),
    }));
  };

  const updateComp = (compId, patch) => {
    setErrorMsg('');
    setForm((prev) => ({
      ...prev,
      competencyRatings: prev.competencyRatings.map((item) =>
        item.competencyId === compId ? { ...item, ...patch } : item
      ),
    }));
  };

  const validateAndSubmit = (submit) => {
    if (submit) {
      const missingNames = [];
      for (const r of form.goalRatings) {
        if ((r.score <= 2 || r.score === 5) && r.evidence.trim().length < 20) {
          const g = review.goals.find((item) => item.id === r.goalId);
          missingNames.push(g ? (lang === 'th' ? g.titleTh : g.title) : r.goalId);
        }
      }
      for (const r of form.competencyRatings) {
        if ((r.score <= 2 || r.score === 5) && r.evidence.trim().length < 20) {
          const c = COMPETENCIES.find((item) => item.id === r.competencyId);
          missingNames.push(c ? (lang === 'th' ? c.nameTh : c.name) : r.competencyId);
        }
      }
      if (missingNames.length > 0) {
        const msg = (t.errEvidenceMissingList || t.drawerEvidenceErr).replace(
          '{items}',
          missingNames.join(', ')
        );
        setErrorMsg(msg);
        return;
      }
    }
    onSave(review.id, form, submit);
    onClose();
  };

  const handleConfirmReturn = () => {
    const len = returnNote.trim().length;
    if (len < 5) {
      setErrorMsg(
        (t.errReasonTooShort || 'Please write at least 5 characters ({n}/5) so the employee knows what to fix.').replace(
          '{n}',
          String(len)
        )
      );
      returnInputRef.current?.focus();
      return;
    }
    onReturnToEmployee(review.id, returnNote.trim());
    onClose();
  };

  const isLocked = readOnly || review.status === 'PUBLISHED';

  return (
    <ModalDialog isOpen labelledBy={titleId} variant="drawer" maxWidthClass="max-w-3xl" onClose={onClose}>
      <div className="h-full bg-(--surface-card) flex flex-col">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-(--border-subtle) flex items-center justify-between gap-4 bg-(--surface-card)">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 id={titleId} className="text-lg font-bold text-(--ink-primary)">
                {lang === 'th' ? review.employee.nameTh : review.employee.name}
              </h1>
              <JobLevelBadge level={review.employee.jobLevel} lang={lang} />
              <StatusBadge tone={review.status === 'PUBLISHED' ? 'high' : review.isOverdue ? 'warn' : 'track'}>
                {t.status[review.status]}
              </StatusBadge>
            </div>
            <p className="text-sm text-(--ink-secondary)">
              {review.employee.title} · {review.employee.department}
              {review.manager && (
                <>
                  {' '}· <span className="font-semibold text-(--ink-primary)">{t.reportingManagerLabel}:</span>{' '}
                  {lang === 'th' ? review.manager.nameTh : review.manager.name}
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.drawerCancel}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-(--ink-primary) cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Governance Inspect-Only Notice when HR inspects an evaluation */}
          {readOnly && (
            <div className="flex items-start gap-2.5 rounded-md border border-(--border-strong) bg-(--surface-subtle) px-4 py-3 text-sm">
              <Lock className="w-4 h-4 mt-0.5 shrink-0 text-(--ink-secondary)" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-bold text-(--ink-primary)">{t.hrInspectOnlyTitle}</p>
                <p className="text-xs text-(--ink-secondary) mt-0.5">{t.hrInspectOnlyDesc}</p>
              </div>
            </div>
          )}

          {/* Show HR Return Card if HR returned this evaluation to the Manager */}
          {review.status === 'SELF_REVIEW_SUBMITTED' && (
            <ReturnFeedbackCard review={review} mode="manager" t={t} />
          )}

          {/* Employee Self-Reflection Summary */}
          <div className="rounded-md border border-(--border-subtle) bg-(--surface-subtle) p-4 space-y-1.5">
            <h3 className="text-sm font-bold text-(--ink-primary)">{t.drawerSelfRef}</h3>
            {review.selfPayload ? (
              <p className="text-sm text-(--ink-secondary)">{review.selfPayload.reflection}</p>
            ) : (
              <p className="text-sm text-(--ink-muted)">{t.drawerNoSelf}</p>
            )}
          </div>

          {/* Goals (What) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-(--ink-primary)">{t.drawerGoalsHeading}</h3>
            {review.goals.map((goal) => {
              const rating = form.goalRatings.find((r) => r.goalId === goal.id);
              const selfGoal = review.selfPayload?.goalAssessments?.find((a) => a.goalId === goal.id);
              const selectedRubric = RUBRIC_LEVELS[(rating?.score || 3) - 1];
              const needsEvidence = rating && (rating.score <= 2 || rating.score === 5);
              const mult = goal.multiplier || 1.0;
              const effectiveScore = Math.min(5, (rating?.score || 3) * mult).toFixed(2);

              return (
                <div
                  key={goal.id}
                  className="rounded-md border border-(--border-subtle) bg-(--surface-card) p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-(--ink-primary)">
                        {lang === 'th' ? goal.titleTh : goal.title}
                      </p>
                      <p className="text-xs text-(--ink-muted) tabular-nums">
                        {t.metricTypes?.[goal.metricType] || goal.metricType || 'QUANTITATIVE'} · {t.targetLabel}: {goal.targetValue || goal.metric} {goal.unit || ''} · {t.weightLabel} {goal.weight}% · {t.multiplierLabel} {mult}x · {t.hitDateLabel}: {goal.dueDate || '—'}
                      </p>
                      {goal.actualValue && (
                        <p className="text-xs font-semibold text-(--ink-primary) mt-0.5 tabular-nums">
                          {t.actualAchievedLabel}: {goal.actualValue} ({goal.progressPct}%)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selfGoal && <StatusBadge tone="neutral">{t.selfShortLabel}: {selfGoal.selfScore}/5</StatusBadge>}
                      <StatusBadge tone="track">{t.effShortLabel}: {effectiveScore}</StatusBadge>
                    </div>
                  </div>

                  {selfGoal?.selfEvidence && (
                    <p className="text-xs text-(--ink-secondary) rounded bg-(--surface-subtle) px-3 py-2">
                      &ldquo;{selfGoal.selfEvidence}&rdquo;
                    </p>
                  )}

                  {/* 1-5 Rating Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const active = rating?.score === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          disabled={isLocked}
                          onClick={() => updateGoal(goal.id, { score: lvl })}
                          className={`min-w-11 min-h-10 px-3 rounded-md border text-sm font-bold tabular-nums transition-colors duration-150 ${
                            active
                              ? 'bg-(--brand-primary) border-(--brand-primary) text-white'
                              : 'bg-(--surface-card) border-(--border-strong) text-(--ink-primary) hover:bg-(--surface-hover)'
                          } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                    <span className="text-xs font-semibold text-(--ink-secondary) ml-1">
                      {lang === 'th' ? selectedRubric.labelTh : selectedRubric.label}
                    </span>
                  </div>

                  <p className="text-xs text-(--ink-secondary) border-l-2 border-(--brand-primary) pl-2.5">
                    {lang === 'th' ? selectedRubric.anchorTh : selectedRubric.anchor}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-(--ink-primary)">
                        {t.drawerEvidenceLabel}
                        {needsEvidence && (
                          <span className="ml-1.5" style={{ color: 'var(--status-warn-text)' }}>
                            * {t.drawerEvidenceRequired}
                          </span>
                        )}
                      </label>
                      <span className="text-(--ink-muted) tabular-nums">
                        {rating?.evidence.trim().length || 0} {t.charsUnit}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      disabled={isLocked}
                      value={rating?.evidence || ''}
                      onChange={(e) => updateGoal(goal.id, { evidence: e.target.value })}
                      placeholder={t.drawerEvidenceRequired}
                      className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary) disabled:bg-(--surface-hover) disabled:text-(--ink-muted)"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Competencies (How) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-(--ink-primary)">{t.drawerCompHeading}</h3>
            {COMPETENCIES.map((comp) => {
              const rating = form.competencyRatings.find((r) => r.competencyId === comp.id);
              const selectedRubric = RUBRIC_LEVELS[(rating?.score || 3) - 1];
              const needsEvidence = rating && (rating.score <= 2 || rating.score === 5);

              return (
                <div
                  key={comp.id}
                  className="rounded-md border border-(--border-subtle) bg-(--surface-card) p-4 space-y-2.5"
                >
                  <p className="text-sm font-bold text-(--ink-primary)">
                    {lang === 'th' ? comp.nameTh : comp.name}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const active = rating?.score === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          disabled={isLocked}
                          onClick={() => updateComp(comp.id, { score: lvl })}
                          className={`min-w-11 min-h-10 px-3 rounded-md border text-sm font-bold tabular-nums transition-colors duration-150 ${
                            active
                              ? 'bg-(--brand-primary) border-(--brand-primary) text-white'
                              : 'bg-(--surface-card) border-(--border-strong) text-(--ink-primary) hover:bg-(--surface-hover)'
                          } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                    <span className="text-xs font-semibold text-(--ink-secondary) ml-1">
                      {lang === 'th' ? selectedRubric.labelTh : selectedRubric.label}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    disabled={isLocked}
                    value={rating?.evidence || ''}
                    onChange={(e) => updateComp(comp.id, { evidence: e.target.value })}
                    placeholder={needsEvidence ? t.drawerEvidenceRequired : t.drawerEvidenceLabel}
                    className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary) disabled:bg-(--surface-hover) disabled:text-(--ink-muted)"
                  />
                </div>
              );
            })}
          </div>

          {/* Summary & Development */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-(--ink-primary)">
                {t.drawerSummaryLabel}
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={form.managerSummary}
                onChange={(e) => setForm((p) => ({ ...p, managerSummary: e.target.value }))}
                className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary) disabled:bg-(--surface-hover)"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-(--ink-primary)">
                {t.drawerDevLabel}
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={form.developmentFocus}
                onChange={(e) => setForm((p) => ({ ...p, developmentFocus: e.target.value }))}
                className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary) disabled:bg-(--surface-hover)"
              />
            </div>
          </div>

          {/* Revision & Comment History */}
          <CommentHistoryPanel history={review.commentHistory || []} t={t} />

          {/* Optional Ping-Pong Return Box */}
          {!isLocked && onReturnToEmployee && showReturnBox && (
            <div
              className="rounded-md border p-4 space-y-2.5"
              style={{
                backgroundColor: 'var(--status-warn-bg)',
                borderColor: 'var(--status-warn-border)',
              }}
            >
              <label className="block text-sm font-bold" style={{ color: 'var(--status-warn-text)' }}>
                {t.returnReviewBtn} — {t.revisionCommentLabel}
              </label>
              <textarea
                ref={returnInputRef}
                rows={2}
                aria-invalid={errorMsg && showReturnBox ? 'true' : 'false'}
                value={returnNote}
                onChange={(e) => {
                  setReturnNote(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder={t.revisionCommentPlaceholder}
                className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary)"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReturnBox(false)}
                  className="min-h-9 px-3 rounded-md border border-(--border-strong) bg-(--surface-card) text-xs font-semibold text-(--ink-primary) cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="min-h-10 px-3.5 rounded-md text-xs font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: 'var(--status-warn-solid)' }}
                >
                  {t.returnReviewBtn}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border p-3 text-sm font-semibold"
              style={{
                backgroundColor: 'var(--status-low-bg)',
                color: 'var(--status-low-text)',
                borderColor: 'var(--status-low-border)',
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-(--border-subtle) bg-(--surface-card) flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) cursor-pointer"
            >
              {t.drawerCancel}
            </button>
            {!isLocked && onReturnToEmployee && (
              <button
                type="button"
                onClick={() => setShowReturnBox((v) => !v)}
                className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md border text-sm font-semibold cursor-pointer"
                style={{
                  backgroundColor: 'var(--status-warn-bg)',
                  color: 'var(--status-warn-text)',
                  borderColor: 'var(--status-warn-border)',
                }}
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>{t.returnReviewBtn}</span>
              </button>
            )}
          </div>

          {readOnly && onHrReturnToManager && (
            <button
              type="button"
              onClick={onHrReturnToManager}
              className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-md border text-sm font-semibold cursor-pointer"
              style={{
                backgroundColor: 'var(--status-warn-bg)',
                color: 'var(--status-warn-text)',
                borderColor: 'var(--status-warn-border)',
              }}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t.hrReturnMgrBtn}</span>
            </button>
          )}

          {!isLocked && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => validateAndSubmit(false)}
                className="min-h-11 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) cursor-pointer"
              >
                {t.drawerSaveDraft}
              </button>
              <button
                type="button"
                onClick={() => validateAndSubmit(true)}
                className="min-h-11 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white cursor-pointer"
              >
                {t.approveToHrBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalDialog>
  );
}
