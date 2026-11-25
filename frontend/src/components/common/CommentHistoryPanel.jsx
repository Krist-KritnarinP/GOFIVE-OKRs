import { MessageSquare, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

const ACTION_TONE = {
  GOAL_SUBMITTED: 'track',
  GOAL_APPROVED: 'high',
  GOAL_REVISION_REQUESTED: 'warn',
  SELF_REVIEW_SUBMITTED: 'track',
  REVIEW_REVISION_REQUESTED: 'warn',
  MANAGER_APPROVED: 'indigo',
  HR_RETURNED_TO_MANAGER: 'low',
  HRBP_ADVISOR_COMMENT: 'indigo',
  PUBLISHED: 'high',
};

export function CommentHistoryPanel({ history = [], t }) {
  return (
    <section className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-(--ink-secondary)" aria-hidden="true" />
          <h3 className="text-sm font-bold text-(--ink-primary)">{t.commentHistoryTitle}</h3>
        </div>
        <span className="text-xs font-semibold text-(--ink-muted) tabular-nums">
          {history.length}
        </span>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-(--ink-muted)">{t.noCommentHistory}</p>
      ) : (
        <ol className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {[...history].reverse().map((item) => {
            const isAdvisor = item.action === 'HRBP_ADVISOR_COMMENT';
            return (
              <li
                key={item.id}
                className="rounded-md border p-3 space-y-1.5 text-sm"
                style={
                  isAdvisor
                    ? {
                        backgroundColor: 'var(--status-indigo-bg)',
                        borderColor: 'var(--status-indigo-border)',
                      }
                    : {
                        backgroundColor: 'var(--surface-subtle)',
                        borderColor: 'var(--border-subtle)',
                      }
                }
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-(--surface-card) border border-(--border-subtle) text-(--ink-primary) tabular-nums">
                      R{item.round || 1}
                    </span>
                    {isAdvisor && (
                      <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--status-indigo-text)' }} aria-hidden="true" />
                    )}
                    <span className="font-bold text-(--ink-primary)">{item.actorName}</span>
                    <span className="text-xs text-(--ink-muted)">
                      ({t.roleLabels?.[item.actorRole] || item.actorRole})
                    </span>
                  </div>
                  <StatusBadge tone={ACTION_TONE[item.action] || 'neutral'}>
                    {t.actionLabels?.[item.action] || item.action}
                  </StatusBadge>
                </div>
                <p className="text-sm text-(--ink-secondary)">{item.comment}</p>
                <p className="text-xs text-(--ink-muted) tabular-nums">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
