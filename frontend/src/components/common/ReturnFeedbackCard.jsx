import { RotateCcw, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

/**
 * High-clarity inline Return Card showing:
 * 1) Who returned the OKR / Self-Review / Evaluation & which round
 * 2) Exact quoted feedback so nothing is buried in history
 * 3) Clear numbered steps explaining exactly how to fix and resubmit
 * 4) Any HRBP Advisor facilitation guidance right alongside
 */
export function ReturnFeedbackCard({ review, mode = 'employee', t }) {
  if (!review) return null;
  const history = review.commentHistory || [];

  const returnActions =
    mode === 'manager'
      ? ['HR_RETURNED_TO_MANAGER', 'HR_RETURN_TO_MANAGER']
      : review.status === 'GOAL_REVISION_REQUIRED'
        ? ['GOAL_REVISION_REQUESTED']
        : review.status === 'REVIEW_REVISION_REQUIRED'
          ? ['REVIEW_REVISION_REQUESTED']
          : [];

  const latestReturn = [...history].reverse().find((c) => returnActions.includes(c.action));
  const latestAdvisor = [...history].reverse().find((c) => c.action === 'HRBP_ADVISOR_COMMENT');

  if (!latestReturn && !latestAdvisor) return null;

  const isGoalReturn = review.status === 'GOAL_REVISION_REQUIRED';
  const isHrReturn = mode === 'manager' && Boolean(latestReturn);

  const heading = isHrReturn
    ? t.returnCardHrTitle
    : isGoalReturn
      ? t.returnCardGoalTitle
      : t.returnCardReviewTitle;

  const steps = isHrReturn
    ? [t.returnStepHr1, t.returnStepHr2, t.returnStepHr3]
    : isGoalReturn
      ? [t.returnStepGoal1, t.returnStepGoal2, t.returnStepGoal3]
      : [t.returnStepRev1, t.returnStepRev2, t.returnStepRev3];

  return (
    <div className="space-y-3">
      {latestReturn && (
        <section
          aria-label={heading}
          className="rounded-lg border p-4 sm:p-5 space-y-3"
          style={{
            backgroundColor: 'var(--status-warn-bg)',
            borderColor: 'var(--status-warn-border)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                style={{
                  backgroundColor: 'var(--surface-card)',
                  color: 'var(--status-warn-text)',
                  border: '1px solid var(--status-warn-border)',
                }}
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold" style={{ color: 'var(--status-warn-text)' }}>
                  {heading}
                </h2>
                <p className="text-xs font-medium text-[var(--ink-secondary)]">
                  {t.returnFromLabel}: <strong>{latestReturn.actorName}</strong> (
                  {t.roleLabels?.[latestReturn.actorRole] || latestReturn.actorRole})
                </p>
              </div>
            </div>

            <StatusBadge tone="warn">
              {t.roundLabel} {latestReturn.round || review.revisionRound || 1}
            </StatusBadge>
          </div>

          <blockquote className="rounded-md border border-[var(--status-warn-border)] bg-[var(--surface-card)] px-3.5 py-2.5 text-sm text-[var(--ink-primary)] leading-relaxed">
            &ldquo;{latestReturn.comment}&rdquo;
          </blockquote>

          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--status-warn-text)' }}>
              {t.returnHowToFixTitle}
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-[var(--ink-primary)]">
              {steps.filter(Boolean).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {latestAdvisor && (
        <section
          aria-label={t.hrbpAdviseBtn}
          className="rounded-lg border p-4 space-y-2"
          style={{
            backgroundColor: 'var(--status-indigo-bg)',
            borderColor: 'var(--status-indigo-border)',
          }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--status-indigo-text)' }} aria-hidden="true" />
              <h3 className="text-sm font-bold" style={{ color: 'var(--status-indigo-text)' }}>
                {t.advisorCardTitle} · {latestAdvisor.actorName}
              </h3>
            </div>
            <StatusBadge tone="indigo">{t.actionLabels?.HRBP_ADVISOR_COMMENT || 'HRBP Advisor'}</StatusBadge>
          </div>
          <p className="text-sm text-[var(--ink-primary)] leading-relaxed">
            {latestAdvisor.comment}
          </p>
        </section>
      )}
    </div>
  );
}
