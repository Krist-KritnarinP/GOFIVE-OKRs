import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MANAGER_DEMO_SWITCHES } from '../constants/roles.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { EvaluationDrawer } from '../components/manager/EvaluationDrawer.jsx';
import { GoalApprovalDrawer } from '../components/manager/GoalApprovalDrawer.jsx';

export function ManagerWorkspacePage({
  reviews,
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
  const completedTeam = teamReviews.filter((r) =>
    ['MANAGER_APPROVED', 'CALIBRATION_LOCKED', 'PUBLISHED'].includes(r.status)
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

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
            {t.mgrTitle}
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-secondary)] mt-0.5">{t.mgrSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase text-[var(--ink-muted)]">
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
                    ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                    : 'bg-[var(--surface-card)] border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {lang === 'th' ? mgr.nameTh : mgr.name} ({lang === 'th' ? mgr.tagTh : mgr.tag})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Team KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiTeamCompletion}</p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)] tabular-nums">
            {teamCompletionPct}%{' '}
            <span className="text-sm font-normal text-[var(--ink-muted)]">
              ({completedTeam}/{teamReviews.length})
            </span>
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiTeamPending}</p>
          <p
            className="mt-1.5 text-2xl font-bold tabular-nums"
            style={{ color: pendingTeamCount > 0 ? 'var(--status-warn-text)' : 'var(--status-high-text)' }}
          >
            {pendingTeamCount}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiTeamVsOrg}</p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)] tabular-nums">
            {teamAvg !== null ? teamAvg.toFixed(2) : '—'}{' '}
            <span className="text-sm font-normal text-[var(--ink-muted)]">
              vs {analytics.orgAverageScore.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      {/* Live Fairness / Bias Guardrail Card */}
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[var(--ink-primary)]">{t.mgrBenchmarkTitle}</h2>
          <div className="flex items-center gap-6 text-sm tabular-nums">
            <span>
              {t.mgrTeamAvg}:{' '}
              <strong className="text-[var(--ink-primary)]">
                {teamAvg !== null ? teamAvg.toFixed(2) : '—'}
              </strong>
            </span>
            <span>
              {t.mgrOrgAvg}:{' '}
              <strong className="text-[var(--ink-primary)]">
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

      {/* Scannable Team Table */}
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs font-bold uppercase text-[var(--ink-secondary)]">
                <th className="py-2.5 px-3">{t.colEmployee}</th>
                <th className="py-2.5 px-3">{t.colStatus}</th>
                <th className="py-2.5 px-3">{t.colScore}</th>
                <th className="py-2.5 px-3 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
              {teamReviews.map((rev) => {
                const isGoalStage = ['GOAL_DRAFT', 'GOAL_PENDING_APPROVAL', 'GOAL_REVISION_REQUIRED'].includes(rev.status);
                return (
                  <tr key={rev.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-[var(--ink-primary)]">
                        {lang === 'th' ? rev.employee.nameTh : rev.employee.name}
                      </p>
                      <p className="text-xs text-[var(--ink-muted)]">{rev.employee.title}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge
                          tone={
                            rev.status === 'PUBLISHED'
                              ? 'high'
                              : ['GOAL_REVISION_REQUIRED', 'REVIEW_REVISION_REQUIRED', 'GOAL_PENDING_APPROVAL'].includes(rev.status) || rev.isOverdue
                                ? 'warn'
                                : 'track'
                          }
                        >
                          {t.status[rev.status]}
                        </StatusBadge>
                        {rev.isOverdue && (
                          <StatusBadge tone="warn">
                            {rev.daysOverdue} {t.daysOverdue}
                          </StatusBadge>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[var(--ink-primary)] tabular-nums">
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
                              ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white'
                              : 'border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
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
                              ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white'
                              : 'border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-[var(--ink-primary)]'
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
        </div>
      </section>

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
