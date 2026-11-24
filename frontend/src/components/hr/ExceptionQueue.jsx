import { Bell, CalendarPlus, MessageSquarePlus, ShieldAlert } from 'lucide-react';
import { getHrbpInterventionClient } from '../../constants/initialData.js';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { JobLevelBadge } from '../common/JobLevelBadge.jsx';
import { TableRegion } from '../common/TableRegion.jsx';
import { ActivityLogPanel } from '../common/ActivityLogPanel.jsx';

export function ExceptionQueue({
  reviews,
  auditLogs,
  t,
  lang,
  onNudge,
  onOpenExtend,
  onOpenEscalate,
  onOpenAdvisor,
}) {
  const alertItems = reviews.filter((r) => {
    const intervention = getHrbpInterventionClient(r);
    return r.isOverdue || r.escalatedToSkipLevel || intervention.needed;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
      <section className="min-w-0 xl:col-span-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
        <div>
          <h2 id="hr-exceptions-heading" className="text-lg font-bold text-[var(--ink-primary)]">{t.exceptionsTitle}</h2>
          <p className="text-sm text-[var(--ink-secondary)]">{t.exceptionsSubtitle}</p>
        </div>

        {alertItems.length === 0 ? (
          <p className="text-sm text-[var(--ink-secondary)] py-4">{t.noExceptions}</p>
        ) : (
          <TableRegion labelledBy="hr-exceptions-heading">
            <table className="w-full text-left border-collapse">
              <caption className="visually-hidden">{t.exceptionsTitle}</caption>
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs font-bold uppercase text-[var(--ink-secondary)]">
                  <th scope="col" className="py-2.5 px-3">{t.colEmployee}</th>
                  <th scope="col" className="py-2.5 px-3">{t.colManager}</th>
                  <th scope="col" className="py-2.5 px-3">{t.colStatus}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
                {alertItems.map((rev) => {
                  const intervention = getHrbpInterventionClient(rev);
                  const isPingPongStall = intervention.reasons.includes('PING_PONG_LIMIT');
                  return (
                    <tr key={rev.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[var(--ink-primary)]">
                            {lang === 'th' ? rev.employee.nameTh : rev.employee.name}
                          </span>
                          <JobLevelBadge level={rev.employee.jobLevel} compact lang={lang} />
                        </div>
                        <div className="text-xs text-[var(--ink-muted)]">{rev.employee.department}</div>
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
                          {isPingPongStall && (
                            <StatusBadge tone="indigo">
                              {t.pingPongLimitBadge.replace('{r}', rev.revisionRound)}
                            </StatusBadge>
                          )}
                          {rev.escalatedToSkipLevel && (
                            <StatusBadge tone="low">{t.status.ESCALATED}</StatusBadge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onOpenAdvisor(rev)}
                            className="inline-flex items-center gap-1 min-h-9 px-2.5 rounded-md border text-xs font-semibold transition-colors duration-150 cursor-pointer"
                            style={{
                              backgroundColor: 'var(--status-indigo-bg)',
                              color: 'var(--status-indigo-text)',
                              borderColor: 'var(--status-indigo-border)',
                            }}
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" aria-hidden="true" />
                            {t.hrbpAdviseBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => onNudge(rev.id)}
                            className="inline-flex items-center gap-1 min-h-9 px-2.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                            {t.nudgeBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenExtend(rev)}
                            className="inline-flex items-center gap-1 min-h-9 px-2.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
                            {t.extendBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEscalate(rev)}
                            className="inline-flex items-center gap-1 min-h-9 px-2.5 rounded-md border text-xs font-semibold transition-colors duration-150 cursor-pointer"
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
                  );
                })}
              </tbody>
            </table>
          </TableRegion>
        )}
      </section>

      <ActivityLogPanel logs={auditLogs} role="HR_ADMIN" t={t} />
    </div>
  );
}
