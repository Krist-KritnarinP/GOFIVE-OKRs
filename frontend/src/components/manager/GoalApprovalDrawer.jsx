import { useState } from 'react';
import { AlertCircle, CheckCircle2, Info, RotateCcw, Users, X } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { JobLevelBadge } from '../common/JobLevelBadge.jsx';
import { CommentHistoryPanel } from '../common/CommentHistoryPanel.jsx';

export function GoalApprovalDrawer({ review, t, lang, onClose, onDecide }) {
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
    if (comment.trim().length < 5) {
      setError(t.revisionCommentPlaceholder);
      return;
    }
    onDecide(review.id, 'REQUEST_REVISION', comment.trim(), null);
    onClose();
  };

  const handleApprove = () => {
    if (totalWeight !== 100) {
      setError(t.weightMustBe100);
      return;
    }
    onDecide(review.id, 'APPROVE', comment.trim() || 'OKRs approved and locked for execution.', edits);
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
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--ink-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Calm 15-min 1-on-1 Alignment Recommendation if Ping-Pong >= 2 */}
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

          {/* Manager Co-Edit Hint */}
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3.5 py-2.5 flex items-start gap-2 text-xs text-[var(--ink-secondary)]">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
            <span>{t.managerCoEditHint}</span>
          </div>

          {/* Proposed OKRs with Direct Manager Co-Edit Weight & Multiplier */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[var(--ink-primary)]">
                OKRs ({review.goals.length})
              </h3>
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
                    {changed && <StatusBadge tone="track">Co-edited</StatusBadge>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--ink-secondary)] tabular-nums">
                    <span>Type: <strong>{g.metricType || 'QUANTITATIVE'}</strong></span>
                    <span>Target: <strong>{g.targetValue} {g.unit}</strong></span>
                    <span>Hit Date: <strong>{g.dueDate || '—'}</strong></span>
                  </div>

                  {/* Direct Manager Weight & Multiplier Controls */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[var(--ink-primary)]">
                        {t.goalWeightLabel}
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={100}
                        step={5}
                        value={edit.weight}
                        onChange={(e) => updateEdit(g.id, { weight: Number(e.target.value) })}
                        className="w-full min-h-9 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-[var(--ink-primary)] tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-[var(--ink-primary)]">
                        {t.goalMultiplierLabel}
                      </label>
                      <select
                        value={edit.multiplier}
                        onChange={(e) => updateEdit(g.id, { multiplier: Number(e.target.value) })}
                        className="w-full min-h-9 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-sm font-semibold text-[var(--ink-primary)] tabular-nums"
                      >
                        <option value={1.0}>{t.multStandard}</option>
                        <option value={1.1}>{t.multStretch}</option>
                        <option value={1.2}>{t.multBreakthrough}</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
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
            disabled={totalWeight !== 100}
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 min-h-11 px-5 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)] text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>{t.approveGoalsBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
