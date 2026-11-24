import { useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { CommentHistoryPanel } from '../common/CommentHistoryPanel.jsx';

export function GoalApprovalDrawer({ review, t, lang, onClose, onDecide }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const totalWeight = review.goals.reduce((acc, g) => acc + Number(g.weight || 0), 0);

  const handleReturn = () => {
    if (comment.trim().length < 5) {
      setError(t.revisionCommentPlaceholder);
      return;
    }
    onDecide(review.id, 'REQUEST_REVISION', comment.trim());
    onClose();
  };

  const handleApprove = () => {
    onDecide(review.id, 'APPROVE', comment.trim() || 'Goals approved and locked for execution.');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: 'var(--backdrop-overlay)' }}
    >
      <div className="w-full max-w-2xl h-full bg-[var(--surface-card)] border-l border-[var(--border-strong)] flex flex-col">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.goalDrawerTitle}</h2>
              <StatusBadge tone="warn">{t.status[review.status]}</StatusBadge>
            </div>
            <p className="text-sm text-[var(--ink-secondary)]">
              {lang === 'th' ? review.employee.nameTh : review.employee.name} · {review.employee.title}
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

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Proposed OKRs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--ink-primary)]">
                Proposed OKR / KPI Goals ({review.goals.length})
              </h3>
              <StatusBadge tone={totalWeight === 100 ? 'high' : 'low'}>
                {t.totalWeightLabel}: {totalWeight}%
              </StatusBadge>
            </div>

            {review.goals.map((g, idx) => (
              <div
                key={g.id}
                className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--ink-primary)]">
                    {idx + 1}. {lang === 'th' ? g.titleTh : g.title}
                  </p>
                  <StatusBadge tone="track">{g.weight}% · {g.multiplier || 1.0}x</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-[var(--ink-secondary)] tabular-nums">
                  <span>Type: <strong>{g.metricType || 'QUANTITATIVE'}</strong></span>
                  <span>Target: <strong>{g.targetValue} {g.unit}</strong></span>
                  <span>Hit Date: <strong>{g.dueDate || '—'}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Past Comment History */}
          <CommentHistoryPanel history={review.commentHistory || []} t={t} />

          {/* Manager Decision Comment */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[var(--ink-primary)]">
              {t.revisionCommentLabel}
            </label>
            <textarea
              rows={3}
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
                className="flex items-center gap-2 rounded-md border p-2.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--status-low-bg)',
                  color: 'var(--status-low-text)',
                  borderColor: 'var(--status-low-border)',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--surface-card)] flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleReturn}
            className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-md border text-sm font-semibold cursor-pointer"
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
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>{t.approveGoalsBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
