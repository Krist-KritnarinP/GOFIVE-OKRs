import { useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, Users } from 'lucide-react';
import { MANAGER_DEMO_SWITCHES } from '../constants/roles.js';
import { filterActivityLogsForRole } from '../constants/initialData.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { JobLevelBadge } from '../components/common/JobLevelBadge.jsx';
import { StageStatusBar } from '../components/common/StageStatusBar.jsx';
import { NextActionBanner } from '../components/common/NextActionBanner.jsx';
import { TableRegion } from '../components/common/TableRegion.jsx';
import { ActivityLogPanel } from '../components/common/ActivityLogPanel.jsx';
import { EvaluationDrawer } from '../components/manager/EvaluationDrawer.jsx';
import { GoalApprovalDrawer } from '../components/manager/GoalApprovalDrawer.jsx';

export function ManagerWorkspacePage({
  cycle,
  reviews,
  auditLogs,
  analytics,
  activeManagerId,
  onSelectManager,
  t,
  lang,
  onDecideGoals,
  onReturnToEmployee,
  onSaveEvaluation,
}) {
  const [evalReview, setEvalReview] = useState(null);
  const [goalReview, setGoalReview] = useState(null);

  const teamReviews = reviews.filter((r) => r.managerId === activeManagerId);
  const managerLogs = filterActivityLogsForRole(auditLogs, {
    role: 'MANAGER',
    userId: activeManagerId,
  });

  const completedTeam = teamReviews.filter((r) =>
    ['MANAGER_APPROVED', 'PUBLISHED'].includes(r.status)
  ).length;
  const teamCompletionPct =
    teamReviews.length > 0 ? Math.round((completedTeam / teamReviews.length) * 100) : 0;
  const pendingTeamCount = teamReviews.length - completedTeam;
  const scoredTeam = teamReviews.filter((r) => typeof r.overallScore === 'number');
  const teamAvg =
    scoredTeam.length > 0
      ? scoredTeam.reduce((a, b) => a + b.overallScore, 0) / scoredTeam.length
      : null;
  const hasBiasRisk = teamAvg !== null && teamAvg - analytics.orgAverageScore >= 0.65;

  const waitingGoals = teamReviews.filter((r) => r.status === 'GOAL_PENDING_APPROVAL');
  const waitingEvals = teamReviews.filter((r) => r.status === 'SELF_REVIEW_SUBMITTED');
  const firstWaitingGoal = waitingGoals[0] || null;
  const firstWaitingEval = waitingEvals[0] || null;
  const hasWaitingAction = Boolean(firstWaitingGoal || firstWaitingEval);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--ink-primary)">
            {t.mgrTitle}
          </h1>
          <p className="text-sm sm:text-base text-(--ink-secondary) mt-0.5">{t.mgrSubtitle}</p>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {teamReviews[0]?.employee?.department && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-(--border-subtle) bg-(--surface-subtle) text-xs font-semibold text-(--ink-secondary)">
                <Building2 className="w-3.5 h-3.5 text-(--ink-muted)" aria-hidden="true" />
                <span>{teamReviews[0].employee.department}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-(--border-subtle) bg-(--surface-card) text-xs font-semibold text-(--ink-primary) tabular-nums">
              <Users className="w-3.5 h-3.5 text-(--brand-primary)" aria-hidden="true" />
              <span className="text-(--ink-muted)">{t.directReportsLabel}:</span>
              <span>
                {teamReviews.length} {t.peopleUnit}
              </span>
              {teamReviews.length > 0 && (
                <span className="text-(--ink-secondary) font-normal">
                  ({teamReviews.map((r) => (lang === 'th' ? r.employee.nameTh : r.employee.name)).join(', ')})
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase text-(--ink-muted)">
            {t.mgrSwitchLabel}:
          </span>
          {MANAGER_DEMO_SWITCHES.map((mgr) => {
            const active = mgr.userId === activeManagerId;
            return (
              <button
                key={mgr.userId}
                type="button"
                onClick={() => onSelectManager(mgr.userId)}
                className={`min-h-10 px-3 rounded-md border text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                  active
                    ? 'bg-(--brand-primary) border-(--brand-primary) text-white'
                    : 'bg-(--surface-card) border-(--border-strong) text-(--ink-primary) hover:bg-(--surface-hover)'
                }`}
              >
                {lang === 'th' ? mgr.nameTh : mgr.name} ({lang === 'th' ? mgr.tagTh : mgr.tag})
              </button>
            );
          })}
        </div>
      </div>

      {/* Single "Your Turn" Manager Next-Action Banner */}
      <NextActionBanner
        tone={hasWaitingAction ? 'action' : 'done'}
        badgeLabel={hasWaitingAction ? t.nextActionYourTurn : t.nextActionDone}
        message={
          hasWaitingAction
            ? t.mgrBannerPending
                .replace('{goals}', String(waitingGoals.length))
                .replace('{reviews}', String(waitingEvals.length))
            : t.mgrBannerDone
        }
        ctaLabel={hasWaitingAction ? t.mgrOpenFirstBtn : ''}
        onCta={
          hasWaitingAction
            ? () => {
                if (firstWaitingGoal) setGoalReview(firstWaitingGoal);
                else if (firstWaitingEval) setEvalReview(firstWaitingEval);
              }
            : null
        }
      />

      {/* 3-Stage Cycle SLA Status Bar */}
      <StageStatusBar mode="cycle" cycle={cycle} reviews={teamReviews} editable={false} t={t} lang={lang} />

      {/* 3 Team KPI Summary Cards — Decided Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiTeamCompletion}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-(--ink-primary) tabular-nums">
            {teamCompletionPct}%{' '}
            <span className="text-sm font-medium text-(--ink-muted)">
              ({completedTeam}/{teamReviews.length})
            </span>
          </p>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiTeamPending}</p>
          <p
            className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums"
            style={{ color: pendingTeamCount > 0 ? 'var(--status-warn-text)' : 'var(--status-high-text)' }}
          >
            {pendingTeamCount}
          </p>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiTeamVsOrg}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-(--ink-primary) tabular-nums">
            {teamAvg !== null ? teamAvg.toFixed(2) : '—'}{' '}
            <span className="text-sm font-medium text-(--ink-muted)">
              vs {analytics.orgAverageScore.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      {/* Live Fairness / Bias Guardrail Card */}
      <section className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-(--ink-primary)">{t.mgrBenchmarkTitle}</h2>
          <div className="flex items-center gap-6 text-sm tabular-nums">
            <span>
              {t.mgrTeamAvg}:{' '}
              <strong className="text-(--ink-primary)">
                {teamAvg !== null ? teamAvg.toFixed(2) : '—'}
              </strong>
            </span>
            <span>
              {t.mgrOrgAvg}:{' '}
              <strong className="text-(--ink-primary)">
                {analytics.orgAverageScore.toFixed(2)}
              </strong>
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-sm font-semibold"
          style={
            hasBiasRisk
              ? {
                  backgroundColor: 'var(--status-warn-bg)',
                  color: 'var(--status-warn-text)',
                  borderColor: 'var(--status-warn-border)',
                }
              : {
                  backgroundColor: 'var(--status-high-bg)',
                  color: 'var(--status-high-text)',
                  borderColor: 'var(--status-high-border)',
                }
          }
        >
          {hasBiasRisk ? (
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          <span>{hasBiasRisk ? t.mgrBiasWarn : t.mgrBiasOk}</span>
        </div>
      </section>

      {/* Scannable Team Table (Full-Width) */}
      <section className="min-w-0 rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5">
        <TableRegion label={t.mgrTitle}>
            <table className="w-full text-left border-collapse">
              <caption className="visually-hidden">{t.mgrTitle}</caption>
              <thead>
                <tr className="border-b border-(--border-subtle) bg-(--surface-subtle) text-xs font-bold uppercase text-(--ink-secondary)">
                  <th scope="col" className="py-2.5 px-3">{t.colEmployee}</th>
                  <th scope="col" className="py-2.5 px-3">{t.colStatus}</th>
                  <th scope="col" className="py-2.5 px-3">{t.colScore}</th>
                  <th scope="col" className="py-2.5 px-3 text-right">{t.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border-subtle) text-sm">
                {teamReviews.map((rev) => {
                  const isGoalStage = ['GOAL_DRAFT', 'GOAL_PENDING_APPROVAL', 'GOAL_REVISION_REQUIRED'].includes(rev.status);
                  return (
                    <tr key={rev.id} className="hover:bg-(--surface-hover) transition-colors duration-150">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-(--ink-primary)">
                            {lang === 'th' ? rev.employee.nameTh : rev.employee.name}
                          </span>
                          <JobLevelBadge level={rev.employee.jobLevel} compact lang={lang} />
                        </div>
                        <p className="text-xs text-(--ink-muted) mt-0.5">{rev.employee.title}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <StatusBadge
                            tone={
                              rev.status === 'PUBLISHED'
                                ? 'high'
                                : rev.status === 'MANAGER_APPROVED'
                                  ? 'indigo'
                                  : ['GOAL_REVISION_REQUIRED', 'REVIEW_REVISION_REQUIRED', 'GOAL_PENDING_APPROVAL'].includes(rev.status) || rev.isOverdue
                                    ? 'warn'
                                    : 'track'
                            }
                          >
                            {t.status[rev.status]}
                          </StatusBadge>
                          {rev.isOverdue && (
                            <StatusBadge tone="low">
                              {rev.daysOverdue} {t.daysOverdue}
                            </StatusBadge>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-(--ink-primary) tabular-nums">
                        {rev.overallScore != null
                          ? `${rev.overallScore.toFixed(2)} (${rev.whatPct?.toFixed(0)}% / ${rev.howScore?.toFixed(1)})`
                          : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {isGoalStage ? (
                          <button
                            type="button"
                            onClick={() => setGoalReview(rev)}
                            className={`min-h-10 px-4 rounded-md text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                              rev.status === 'GOAL_PENDING_APPROVAL'
                                ? 'bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-white'
                                : 'border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-(--ink-primary)'
                            }`}
                          >
                            {t.reviewGoalsBtn}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEvalReview(rev)}
                            className={`min-h-10 px-4 rounded-md text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                              rev.status === 'SELF_REVIEW_SUBMITTED'
                                ? 'bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-white'
                                : 'border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-(--ink-primary)'
                            }`}
                          >
                            {rev.status === 'PUBLISHED' ? t.viewBtn : t.evaluateBtn}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </TableRegion>
      </section>

      {/* Team-Only Activity Log — Always Anchored at Bottom */}
      <ActivityLogPanel logs={managerLogs} role="MANAGER" t={t} />

      {goalReview && (
        <GoalApprovalDrawer
          key={goalReview.id}
          review={goalReview}
          t={t}
          lang={lang}
          onClose={() => setGoalReview(null)}
          onDecide={onDecideGoals}
        />
      )}

      {evalReview && (
        <EvaluationDrawer
          key={evalReview.id}
          review={evalReview}
          t={t}
          lang={lang}
          onClose={() => setEvalReview(null)}
          onSave={onSaveEvaluation}
          onReturnToEmployee={onReturnToEmployee}
        />
      )}
    </div>
  );
}
