import { Bell, CalendarPlus, MessageSquarePlus, ShieldAlert } from 'lucide-react';
import { getHrbpInterventionClient } from '../../constants/initialData.js';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { JobLevelBadge } from '../common/JobLevelBadge.jsx';
import { TableRegion } from '../common/TableRegion.jsx';

function ActionTooltip({ text, children }) {
  return (
    <span className="relative inline-flex group/tip">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none opacity-0 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 transition-opacity duration-150 absolute bottom-full right-0 mb-2 z-30 w-52 rounded-md px-2.5 py-1.5 text-[11px] font-medium leading-snug text-white shadow-md text-left"
        style={{ backgroundColor: '#0F172A' }}
      >
        {text}
      </span>
    </span>
  );
}

export function ExceptionQueue({
  reviews,
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
    <section className="min-w-0 rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 space-y-4">
      <div>
        <h2 id="hr-exceptions-heading" className="text-lg font-bold text-(--ink-primary)">{t.exceptionsTitle}</h2>
        <p className="text-sm text-(--ink-secondary)">{t.exceptionsSubtitle}</p>
      </div>

      {alertItems.length === 0 ? (
        <p className="text-sm text-(--ink-secondary) py-4">{t.noExceptions}</p>
      ) : (
        <TableRegion labelledBy="hr-exceptions-heading">
          <table className="w-full text-left border-collapse">
            <caption className="visually-hidden">{t.exceptionsTitle}</caption>
            <thead>
              <tr className="border-b border-(--border-subtle) bg-(--surface-subtle) text-xs font-bold uppercase text-(--ink-secondary)">
                <th scope="col" className="py-2.5 px-3">{t.colEmployee}</th>
                <th scope="col" className="py-2.5 px-3">{t.colManager}</th>
                <th scope="col" className="py-2.5 px-3">{t.colStatus}</th>
                <th scope="col" className="py-2.5 px-3 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle) text-sm">
              {alertItems.map((rev) => {
                const intervention = getHrbpInterventionClient(rev);
                const isPingPongStall = intervention.reasons.includes('PING_PONG_LIMIT');
                return (
                  <tr key={rev.id} className="hover:bg-(--surface-hover) transition-colors duration-150">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-(--ink-primary)">
                          {lang === 'th' ? rev.employee.nameTh : rev.employee.name}
                        </span>
                        <JobLevelBadge level={rev.employee.jobLevel} compact lang={lang} />
                      </div>
                      <div className="text-xs text-(--ink-muted)">{rev.employee.department}</div>
                    </td>
                    <td className="py-3 px-3 text-(--ink-secondary)">
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
                        <ActionTooltip text={t.tipAdvisor}>
                          <button
                            type="button"
                            onClick={() => onOpenAdvisor(rev)}
                            className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border active:scale-98 text-xs font-semibold transition-[background-color,transform] duration-150 cursor-pointer"
                            style={{
                              backgroundColor: 'var(--status-indigo-bg)',
                              color: 'var(--status-indigo-text)',
                              borderColor: 'var(--status-indigo-border)',
                            }}
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" aria-hidden="true" />
                            {t.hrbpAdviseBtn}
                          </button>
                        </ActionTooltip>
                        <ActionTooltip text={t.tipReminder}>
                          <button
                            type="button"
                            onClick={() => onNudge(rev.id)}
                            className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) active:scale-98 text-xs font-semibold text-(--ink-primary) transition-[background-color,transform] duration-150 cursor-pointer"
                          >
                            <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                            {t.nudgeBtn}
                          </button>
                        </ActionTooltip>
                        <ActionTooltip text={t.tipExtend}>
                          <button
                            type="button"
                            onClick={() => onOpenExtend(rev)}
                            className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) active:scale-98 text-xs font-semibold text-(--ink-primary) transition-[background-color,transform] duration-150 cursor-pointer"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
                            {t.extendBtn}
                          </button>
                        </ActionTooltip>
                        <ActionTooltip text={t.tipEscalate}>
                          <button
                            type="button"
                            onClick={() => onOpenEscalate(rev)}
                            className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border active:scale-98 text-xs font-semibold transition-[background-color,transform] duration-150 cursor-pointer"
                            style={{
                              backgroundColor: 'var(--status-low-bg)',
                              color: 'var(--status-low-text)',
                              borderColor: 'var(--status-low-border)',
                            }}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                            {t.escalateBtn}
                          </button>
                        </ActionTooltip>
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
  );
}
