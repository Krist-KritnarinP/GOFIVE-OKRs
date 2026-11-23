import { Bell, CalendarPlus, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge.jsx';

export function ExceptionQueue({
  reviews,
  auditLogs,
  t,
  lang,
  onNudge,
  onOpenExtend,
  onOpenEscalate,
}) {
  const overdueItems = reviews.filter((r) => r.isOverdue || r.escalatedToSkipLevel);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <section className="xl:col-span-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.exceptionsTitle}</h2>
          <p className="text-sm text-[var(--ink-secondary)]">{t.exceptionsSubtitle}</p>
        </div>

        {overdueItems.length === 0 ? (
          <p className="text-sm text-[var(--ink-secondary)] py-4">{t.noExceptions}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs font-bold uppercase text-[var(--ink-secondary)]">
                  <th className="py-2.5 px-3">{t.colEmployee}</th>
                  <th className="py-2.5 px-3">{t.colManager}</th>
                  <th className="py-2.5 px-3">{t.colStatus}</th>
                  <th className="py-2.5 px-3 text-right">{t.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                {overdueItems.map((rev) => (
                  <tr key={rev.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150">
                    <td className="py-3 px-3 font-semibold text-[var(--ink-primary)]">
                      {lang === 'th' ? rev.employee.nameTh : rev.employee.name}
                      <div className="text-xs font-normal text-[var(--ink-muted)]">{rev.employee.department}</div>
                    </td>
                    <td className="py-3 px-3 text-[var(--ink-secondary)]">
                      {lang === 'th' ? rev.manager?.nameTh : rev.manager?.name}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {rev.isOverdue && (
                          <StatusBadge tone="warn">
                            {rev.daysOverdue} {t.daysOverdue}
                          </StatusBadge>
                        )}
                        {rev.escalatedToSkipLevel && (
                          <StatusBadge tone="low">{t.status.ESCALATED}</StatusBadge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onNudge(rev.id)}
                          className="inline-flex items-center gap-1.5 min-h-9 px-2.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                          {t.nudgeBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenExtend(rev)}
                          className="inline-flex items-center gap-1.5 min-h-9 px-2.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
                          {t.extendBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEscalate(rev)}
                          className="inline-flex items-center gap-1.5 min-h-9 px-2.5 rounded-md border text-xs font-semibold transition-colors duration-150 cursor-pointer"
                          style={{
                            backgroundColor: 'var(--status-low-bg)',
                            color: 'var(--status-low-text)',
                            borderColor: 'var(--status-low-border)',
                          }}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                          {t.escalateBtn}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Audit Log Panel */}
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.auditLogTitle}</h2>
        <ul className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <li
              key={log.id}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3 text-xs space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--ink-primary)]">{log.action}</span>
                <span className="text-[var(--ink-muted)] tabular-nums">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[var(--ink-secondary)]">{log.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
