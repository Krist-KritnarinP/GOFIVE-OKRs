import { Activity, Shield } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

const ACTION_TONE = {
  PUBLISH: 'high',
  HR_PUBLISH_BATCH: 'high',
  GOAL_APPROVED: 'high',
  GOAL_SUBMITTED: 'track',
  SELF_REVIEW_SUBMITTED: 'track',
  HRBP_ADVISOR_COMMENT: 'indigo',
  UPDATE_STAGE_DEADLINES: 'indigo',
  EXTEND_DEADLINE: 'track',
  NUDGE: 'warn',
  GOAL_REVISION_REQUESTED: 'warn',
  REVIEW_REVISION_REQUESTED: 'warn',
  HR_RETURN_TO_MANAGER: 'warn',
  BIAS_ALERT_FLAGGED: 'low',
  ESCALATE: 'low',
  LOCK_CYCLE: 'warn',
  UNLOCK_CYCLE: 'high',
  ADMIN_UPDATE_USER: 'indigo',
  UPDATE_ROLE_PERMISSION: 'indigo',
  USER_REGISTERED: 'warn',
};

const SCOPE_META = {
  SUPER_ADMIN: { tone: 'indigo', key: 'logScopeSuper' },
  HR_ADMIN: { tone: 'track', key: 'logScopeHr' },
  MANAGER: { tone: 'high', key: 'logScopeManager' },
  EMPLOYEE: { tone: 'neutral', key: 'logScopeEmployee' },
};

export function ActivityLogPanel({ logs = [], role = 'HR_ADMIN', t }) {
  const scopeInfo = SCOPE_META[role] || SCOPE_META.HR_ADMIN;

  return (
    <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
          <h2 className="text-base font-bold text-[var(--ink-primary)]">{t.activityLogTitle}</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[var(--ink-secondary)] tabular-nums">
            {logs.length}
          </span>
        </div>

        <StatusBadge tone={scopeInfo.tone}>
          <Shield className="w-3 h-3" aria-hidden="true" />
          <span>{t[scopeInfo.key]}</span>
        </StatusBadge>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-[var(--ink-muted)] py-3">{t.noActivityLogs}</p>
      ) : (
        <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge tone={ACTION_TONE[log.action] || 'neutral'}>
                    {t.actionLabels?.[log.action] || log.action}
                  </StatusBadge>
                  <span className="font-bold text-[var(--ink-primary)]">{log.actorName}</span>
                </div>
                <span className="text-[var(--ink-muted)] tabular-nums">
                  {new Date(log.createdAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
                {log.reason}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
