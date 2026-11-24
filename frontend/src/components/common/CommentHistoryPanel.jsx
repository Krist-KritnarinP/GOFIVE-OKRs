import { MessageSquare } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

const ACTION_TONE = {
  GOAL_SUBMITTED: 'track',
  GOAL_APPROVED: 'high',
  GOAL_REVISION_REQUESTED: 'warn',
  SELF_REVIEW_SUBMITTED: 'track',
  REVIEW_REVISION_REQUESTED: 'warn',
  MANAGER_APPROVED: 'high',
  HR_RETURNED_TO_MANAGER: 'low',
  CALIBRATION_LOCKED: 'track',
  PUBLISHED: 'high',
};

export function CommentHistoryPanel({ history = [], t }) {
  return (
    <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
          <h3 className="text-sm font-bold text-[var(--ink-primary)]">{t.commentHistoryTitle}</h3>
        </div>
        <span className="text-xs font-semibold text-[var(--ink-muted)] tabular-nums">
          {history.length}
        </span>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)]">{t.noCommentHistory}</p>
      ) : (
        <ol className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {[...history].reverse().map((item) => (
            <li
              key={item.id}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3 space-y-1.5 text-sm"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--ink-primary)] tabular-nums">
                    R{item.round || 1}
                  </span>
                  <span className="font-bold text-[var(--ink-primary)]">{item.actorName}</span>
                  <span className="text-xs text-[var(--ink-muted)]">({item.actorRole})</span>
                </div>
                <StatusBadge tone={ACTION_TONE[item.action] || 'neutral'}>
                  {item.action}
                </StatusBadge>
              </div>
              <p className="text-sm text-[var(--ink-secondary)]">{item.comment}</p>
              <p className="text-xs text-[var(--ink-muted)] tabular-nums">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
