import { useId, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, RotateCcw, Users, X } from 'lucide-react';
import { ModalDialog } from '../common/ModalDialog.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { JobLevelBadge } from '../common/JobLevelBadge.jsx';
import { CommentHistoryPanel } from '../common/CommentHistoryPanel.jsx';
import { TieredSelect } from '../common/TieredSelect.jsx';

export function GoalApprovalDrawer({ review, t, lang, onClose, onDecide }) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const commentId = `${uid}-comment`;
  const errorId = `${uid}-error`;
  const commentRef = useRef(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [edits, setEdits] = useState(() =>
    review.goals.map((g) => ({
      id: g.id,
      weight: Number(g.weight || 0),
      multiplier: Number(g.multiplier || 1.0),
    }))
  );

  const totalWeight = edits.reduce((acc, g) => acc + Number(g.weight || 0), 0);

  const updateEdit = (goalId, patch) => {
    setError('');
    setEdits((prev) => prev.map((item) => (item.id === goalId ? { ...item, ...patch } : item)));
  };

  const handleReturn = () => {
    const len = comment.trim().length;
    if (len < 5) {
      setError(
        (t.errReasonTooShort || 'Please write at least 5 characters ({n}/5) so the employee knows what to adjust.').replace(
          '{n}',
          String(len)
        )
      );
      commentRef.current?.focus();
      return;
    }
    onDecide(review.id, 'REQUEST_REVISION', comment.trim(), null);
    onClose();
  };

  const handleApprove = () => {
    if (totalWeight !== 100) {
      setError(
        (t.errWeightNot100 || t.weightMustBe100).replace('{w}', String(totalWeight))
      );
      return;
    }
    onDecide(review.id, 'APPROVE', comment.trim() || 'OKRs approved and locked for execution.', edits);
    onClose();
  };

  return (
    <ModalDialog isOpen labelledBy={titleId} variant="drawer" maxWidthClass="max-w-2xl" onClose={onClose}>
      <div className="h-full flex flex-col bg-[var(--surface-card)]">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 id={titleId} className="text-lg font-bold text-[var(--ink-primary)]">
                {t.goalDrawerTitle}
              </h1>
              <JobLevelBadge level={review.employee.jobLevel} lang={lang} />
              <StatusBadge tone="warn">{t.status[review.status]}</StatusBadge>
            </div>
            <p className="text-sm text-[var(--ink-secondary)] mt-0.5">
              {lang === 'th' ? review.employee.nameTh : review.employee.name} · {review.employee.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.drawerCancel}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--ink-primary)] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {(review.revisionRound || 1) >= 2 && (
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

          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3.5 py-2.5 flex items-start gap-2 text-xs text-[var(--ink-secondary)]">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
            <span>{t.managerCoEditHint}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--ink-primary)]">
                OKRs ({review.goals.length})
              </h2>
              <StatusBadge tone={totalWeight === 100 ? 'high' : 'low'}>
                {t.totalWeightLabel}: {totalWeight}% / 100%
              </StatusBadge>
            </div>

            {review.goals.map((g, idx) => {
              const edit = edits.find((e) => e.id === g.id) || {
                weight: g.weight,
                multiplier: g.multiplier || 1.0,
              };
              const changed =
                Number(edit.weight) !== Number(g.weight) ||
                Number(edit.multiplier) !== Number(g.multiplier || 1.0);
              const wId = `${uid}-w-${g.id}`;
              const mId = `${uid}-m-${g.id}`;
              const metricLabel = t.metricTypes?.[g.metricType] || g.metricType || 'QUANTITATIVE';

              return (
                <div
                  key={g.id}
                  className="rounded-md border p-4 space-y-3"
                  style={{
                    backgroundColor: changed ? 'var(--status-track-bg)' : 'var(--surface-subtle)',
                    borderColor: changed ? 'var(--status-track-border)' : 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-[var(--ink-primary)]">
                      {idx + 1}. {lang === 'th' ? g.titleTh : g.title}
                    </p>
                    {changed && <StatusBadge tone="track">{t.coEditedBadge || 'Co-edited'}</StatusBadge>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--ink-secondary)] tabular-nums">
                    <span>{t.typeLabel || 'Type'}: <strong>{metricLabel}</strong></span>
                    <span>{t.targetLabel || 'Target'}: <strong>{g.targetValue} {g.unit}</strong></span>
                    <span>{t.hitDateLabel || 'Hit Date'}: <strong>{g.dueDate || '—'}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <label htmlFor={wId} className="block text-xs font-semibold text-[var(--ink-primary)]">
                        {t.goalWeightLabel}
                      </label>
                      <input
                        id={wId}
                        type="number"
                        min={5}
                        max={100}
                        step={5}
                        value={edit.weight}
                        onChange={(e) => updateEdit(g.id, { weight: Number(e.target.value) })}
                        className="w-full min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-[var(--ink-primary)] tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={mId} className="block text-xs font-semibold text-[var(--ink-primary)]">
                        {t.goalMultiplierLabel}
                      </label>
                      <TieredSelect
                        id={mId}
                        value={edit.multiplier}
                        onChange={(e) => updateEdit(g.id, { multiplier: Number(e.target.value) })}
                        className="w-full tabular-nums"
                        options={[
                          { value: 1.0, label: t.multStandard, tone: 'neutral' },
                          { value: 1.1, label: t.multStretch, tone: 'track' },
                          { value: 1.2, label: t.multBreakthrough, tone: 'indigo' },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <CommentHistoryPanel history={review.commentHistory || []} t={t} />

          <div className="space-y-1.5">
            <label htmlFor={commentId} className="block text-sm font-semibold text-[var(--ink-primary)]">
              {t.revisionCommentLabel}
            </label>
            <textarea
              ref={commentRef}
              id={commentId}
              rows={3}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : undefined}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError('');
              }}
              placeholder={t.revisionCommentPlaceholder}
              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--ink-primary)]"
            />
            {error && (
              <div
                id={errorId}
                role="alert"
                className="flex items-start gap-2 rounded-md border p-2.5 text-xs sm:text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--status-low-bg)',
                  color: 'var(--status-low-text)',
                  borderColor: 'var(--status-low-border)',
                }}
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleReturn}
            className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-md border active:scale-[0.98] text-sm font-semibold transition-transform duration-150 cursor-pointer"
            style={{
              backgroundColor: 'var(--status-warn-bg)',
              color: 'var(--status-warn-text)',
              borderColor: 'var(--status-warn-border)',
            }}
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{t.requestRevisionBtn}</span>
          </button>

          <button
            type="button"
            disabled={totalWeight !== 100}
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] active:scale-[0.98] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)] text-sm font-semibold text-white transition-[background-color,transform] duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>{t.approveGoalsBtn}</span>
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
