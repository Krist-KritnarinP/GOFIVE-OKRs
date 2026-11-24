import { useState } from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { COMPETENCIES, RUBRIC_LEVELS } from '../../constants/rubric.js';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { CommentHistoryPanel } from '../common/CommentHistoryPanel.jsx';

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
}) {
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
      const invalidGoal = form.goalRatings.some(
        (r) => (r.score <= 2 || r.score === 5) && r.evidence.trim().length < 20
      );
      const invalidComp = form.competencyRatings.some(
        (r) => (r.score <= 2 || r.score === 5) && r.evidence.trim().length < 20
      );
      if (invalidGoal || invalidComp) {
        setErrorMsg(t.drawerEvidenceErr);
        return;
      }
    }
    onSave(review.id, form, submit);
    onClose();
  };

  const handleConfirmReturn = () => {
    if (returnNote.trim().length < 5) {
      setErrorMsg(t.revisionCommentPlaceholder);
      return;
    }
    onReturnToEmployee(review.id, returnNote.trim());
    onClose();
  };

  const isLocked = readOnly || review.status === 'PUBLISHED';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: 'var(--backdrop-overlay)' }}
    >
      <div className="w-full max-w-3xl h-full bg-[var(--surface-card)] border-l border-[var(--border-strong)] flex flex-col">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4 bg-[var(--surface-card)]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-[var(--ink-primary)]">
                {lang === 'th' ? review.employee.nameTh : review.employee.name}
              </h2>
              <StatusBadge tone={review.status === 'PUBLISHED' ? 'high' : review.isOverdue ? 'warn' : 'track'}>
                {t.status[review.status]}
              </StatusBadge>
            </div>
            <p className="text-sm text-[var(--ink-secondary)]">
              {review.employee.title} · {review.employee.department}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.drawerCancel}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--ink-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Employee Self-Reflection Summary */}
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 space-y-1.5">
            <h3 className="text-sm font-bold text-[var(--ink-primary)]">{t.drawerSelfRef}</h3>
            {review.selfPayload ? (
              <p className="text-sm text-[var(--ink-secondary)]">{review.selfPayload.reflection}</p>
            ) : (
              <p className="text-sm text-[var(--ink-muted)]">{t.drawerNoSelf}</p>
            )}
          </div>

          {/* Goals (What) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--ink-primary)]">{t.drawerGoalsHeading}</h3>
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
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[var(--ink-primary)]">
                        {lang === 'th' ? goal.titleTh : goal.title}
                      </p>
                      <p className="text-xs text-[var(--ink-muted)] tabular-nums">
                        {goal.metricType || 'QUANTITATIVE'} · Target: {goal.targetValue || goal.metric} {goal.unit || ''} · Weight {goal.weight}% · Multiplier {mult}x · Hit: {goal.dueDate || '—'}
                      </p>
                      {goal.actualValue && (
                        <p className="text-xs font-semibold text-[var(--ink-primary)] mt-0.5 tabular-nums">
                          {t.actualAchievedLabel}: {goal.actualValue} ({goal.progressPct}%)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selfGoal && <StatusBadge tone="neutral">Self: {selfGoal.selfScore}/5</StatusBadge>}
                      <StatusBadge tone="track">Eff: {effectiveScore}</StatusBadge>
                    </div>
                  </div>

                  {selfGoal?.selfEvidence && (
                    <p className="text-xs text-[var(--ink-secondary)] rounded bg-[var(--surface-subtle)] px-3 py-2">
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
                              ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                              : 'bg-[var(--surface-card)] border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]'
                          } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                    <span className="text-xs font-semibold text-[var(--ink-secondary)] ml-1">
                      {lang === 'th' ? selectedRubric.labelTh : selectedRubric.label}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--ink-secondary)] border-l-2 border-[var(--brand-primary)] pl-2.5">
                    {lang === 'th' ? selectedRubric.anchorTh : selectedRubric.anchor}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-[var(--ink-primary)]">
                        {t.drawerEvidenceLabel}
                        {needsEvidence && (
                          <span className="ml-1.5" style={{ color: 'var(--status-warn-text)' }}>
                            * {t.drawerEvidenceRequired}
                          </span>
                        )}
                      </label>
                      <span className="text-[var(--ink-muted)] tabular-nums">
                        {rating?.evidence.trim().length || 0} chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      disabled={isLocked}
                      value={rating?.evidence || ''}
                      onChange={(e) => updateGoal(goal.id, { evidence: e.target.value })}
                      placeholder={t.drawerEvidenceRequired}
                      className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Competencies (How) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--ink-primary)]">{t.drawerCompHeading}</h3>
            {COMPETENCIES.map((comp) => {
              const rating = form.competencyRatings.find((r) => r.competencyId === comp.id);
              const selectedRubric = RUBRIC_LEVELS[(rating?.score || 3) - 1];
              const needsEvidence = rating && (rating.score <= 2 || rating.score === 5);

              return (
                <div
                  key={comp.id}
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-2.5"
                >
                  <p className="text-sm font-bold text-[var(--ink-primary)]">
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
                              ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                              : 'bg-[var(--surface-card)] border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]'
                          } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                    <span className="text-xs font-semibold text-[var(--ink-secondary)] ml-1">
                      {lang === 'th' ? selectedRubric.labelTh : selectedRubric.label}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    disabled={isLocked}
                    value={rating?.evidence || ''}
                    onChange={(e) => updateComp(comp.id, { evidence: e.target.value })}
                    placeholder={needsEvidence ? t.drawerEvidenceRequired : t.drawerEvidenceLabel}
                    className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)]"
                  />
                </div>
              );
            })}
          </div>

          {/* Summary & Development */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.drawerSummaryLabel}
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={form.managerSummary}
                onChange={(e) => setForm((p) => ({ ...p, managerSummary: e.target.value }))}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)] disabled:bg-[var(--surface-hover)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--ink-primary)]">
                {t.drawerDevLabel}
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={form.developmentFocus}
                onChange={(e) => setForm((p) => ({ ...p, developmentFocus: e.target.value }))}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)] disabled:bg-[var(--surface-hover)]"
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
                rows={2}
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder={t.revisionCommentPlaceholder}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReturnBox(false)}
                  className="min-h-9 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] text-xs font-semibold text-[var(--ink-primary)] cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="min-h-9 px-3 rounded-md text-xs font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: '#B45309' }}
                >
                  {t.confirmBtn}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div
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
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] cursor-pointer"
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

          {!isLocked && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => validateAndSubmit(false)}
                className="min-h-11 px-4 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] cursor-pointer"
              >
                {t.drawerSaveDraft}
              </button>
              <button
                type="button"
                onClick={() => validateAndSubmit(true)}
                className="min-h-11 px-4 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white cursor-pointer"
              >
                {t.approveToHrBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
