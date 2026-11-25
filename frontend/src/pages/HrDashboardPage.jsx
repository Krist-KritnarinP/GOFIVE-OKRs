import { useState } from 'react';
import { Building2, Clock, Lock, RotateCcw, Send, X } from 'lucide-react';
import {
  computeAnalytics,
  filterActivityLogsForRole,
  getHrbpInterventionClient,
} from '../constants/initialData.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { JobLevelBadge } from '../components/common/JobLevelBadge.jsx';
import { StageStatusBar } from '../components/common/StageStatusBar.jsx';
import { TableRegion } from '../components/common/TableRegion.jsx';
import { ActivityLogPanel } from '../components/common/ActivityLogPanel.jsx';
import { ModalDialog } from '../components/common/ModalDialog.jsx';
import { ReasonModal } from '../components/common/ReasonModal.jsx';
import { NineBoxGrid } from '../components/hr/NineBoxGrid.jsx';
import { OrgDistributionBar } from '../components/hr/OrgDistributionBar.jsx';
import { ExceptionQueue } from '../components/hr/ExceptionQueue.jsx';
import { EvaluationDrawer } from '../components/manager/EvaluationDrawer.jsx';

export function HrDashboardPage({
  cycle,
  reviews,
  auditLogs,
  analytics,
  currentUser,
  can,
  t,
  lang,
  onUpdateStageDeadlines,
  onToggleGracePeriod,
  onToggleLockCycle,
  onNudge,
  onExtendDeadline,
  onEscalate,
  onPostHrbpAdvisorComment,
  onHrReturnToManager,
  onDecideGoalAmendment,
  onPublishReady,
}) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [hrScope, setHrScope] = useState('ALL');

  const canConfigure = can ? can('cycle:configure') : true;
  const canPublish = can ? can('review:publish') : true;

  const assignedDepts = Array.isArray(currentUser?.assignedDepartments)
    ? currentUser.assignedDepartments
    : [];
  const hasHrbpScope = assignedDepts.length > 0;
  const scopedReviews =
    hrScope === 'MY_TEAMS' && hasHrbpScope
      ? reviews.filter((r) => assignedDepts.includes(r.employee?.department))
      : reviews;
  const scopedAnalytics =
    hrScope === 'MY_TEAMS' && hasHrbpScope ? computeAnalytics(scopedReviews) : analytics;

  const hrLogs = filterActivityLogsForRole(auditLogs, {
    role: 'HR_ADMIN',
    userId: currentUser?.id,
  });

  const completed = scopedReviews.filter((r) =>
    ['MANAGER_APPROVED', 'PUBLISHED'].includes(r.status)
  ).length;
  const completionPct =
    scopedReviews.length > 0 ? Math.round((completed / scopedReviews.length) * 100) : 0;
  const alertCount = scopedReviews.filter(
    (r) => r.isOverdue || getHrbpInterventionClient(r).needed
  ).length;
  const readyToPublishReviews = reviews.filter((r) => r.status === 'MANAGER_APPROVED');
  const readyToPublishCount = readyToPublishReviews.length;
  const inProgressReviews = reviews.filter(
    (r) => !['MANAGER_APPROVED', 'PUBLISHED'].includes(r.status)
  );

  return (
    <div className="w-full space-y-6">
      {/* Header & Operational Controls (Approach A: Single clean HR Approve & Publish CTA) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--ink-primary)">
            {t.hrTitle}
          </h1>
          <p className="text-sm sm:text-base text-(--ink-secondary) mt-0.5">{t.hrSubtitle}</p>
          {hasHrbpScope && (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-(--border-subtle) bg-(--surface-subtle) text-xs font-semibold text-(--ink-secondary)">
                <Building2 className="w-3.5 h-3.5 text-(--brand-primary)" aria-hidden="true" />
                <span>{t.hrbpScopeLabel}:</span>
                <span className="text-(--ink-primary)">{assignedDepts.join(', ')}</span>
              </span>
              <div
                role="group"
                aria-label={t.hrbpScopeLabel}
                className="inline-flex rounded-md border border-(--border-strong) bg-(--surface-card) p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setHrScope('ALL')}
                  aria-pressed={hrScope === 'ALL'}
                  className={`min-h-8 px-2.5 rounded text-xs font-semibold transition-colors duration-150 cursor-pointer tabular-nums ${
                    hrScope === 'ALL'
                      ? 'bg-(--brand-primary) text-white'
                      : 'text-(--ink-secondary) hover:bg-(--surface-hover)'
                  }`}
                >
                  {t.hrScopeAll} ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHrScope('MY_TEAMS')}
                  aria-pressed={hrScope === 'MY_TEAMS'}
                  className={`min-h-8 px-2.5 rounded text-xs font-semibold transition-colors duration-150 cursor-pointer tabular-nums ${
                    hrScope === 'MY_TEAMS'
                      ? 'bg-(--brand-primary) text-white'
                      : 'text-(--ink-secondary) hover:bg-(--surface-hover)'
                  }`}
                >
                  {t.hrScopeMyTeams} (
                  {reviews.filter((r) => assignedDepts.includes(r.employee?.department)).length})
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            disabled={!canConfigure}
            onClick={onToggleGracePeriod}
            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) disabled:bg-(--surface-hover) disabled:text-(--ink-muted) text-sm font-semibold text-(--ink-primary) transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            <Clock className="w-4 h-4 text-(--ink-secondary)" aria-hidden="true" />
            <span>{t.graceToggleLabel}: {cycle.isGracePeriodActive ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            disabled={!canConfigure}
            onClick={onToggleLockCycle}
            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) disabled:bg-(--surface-hover) disabled:text-(--ink-muted) text-sm font-semibold text-(--ink-primary) transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4 text-(--ink-secondary)" aria-hidden="true" />
            <span>{t.lockToggleLabel}: {cycle.isLocked ? 'ON' : 'OFF'}</span>
          </button>

          {/* Approach A Primary CTA: HR Approve & Publish (MANAGER_APPROVED -> PUBLISHED) */}
          <button
            type="button"
            disabled={readyToPublishCount === 0 || !canPublish}
            onClick={() => setShowPublishConfirm(true)}
            title={!canPublish ? t.permDeniedBanner : undefined}
            className="inline-flex items-center gap-2 min-h-11 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) disabled:bg-(--surface-hover) disabled:text-(--ink-muted) disabled:border disabled:border-(--border-subtle) text-sm font-semibold text-white transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed tabular-nums"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{t.publishAllCta} ({readyToPublishCount})</span>
          </button>
        </div>
      </div>

      {/* 3-Stage Due Date Timeline Bar (Editable by HR with Real Pending Counts + Countdown / Overdue / Early chips) */}
      <StageStatusBar
        mode="cycle"
        cycle={cycle}
        reviews={scopedReviews}
        editable={canConfigure}
        onSaveDeadlines={onUpdateStageDeadlines}
        t={t}
        lang={lang}
      />

      {/* 4 KPI Summary Cards — Decided Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiCompletion}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-(--ink-primary) tabular-nums">
            {completionPct}% <span className="text-sm font-medium text-(--ink-muted)">({completed}/{scopedReviews.length})</span>
          </p>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiOverdue}</p>
          <p
            className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums"
            style={{ color: alertCount > 0 ? 'var(--status-warn-text)' : 'var(--status-high-text)' }}
          >
            {alertCount}
          </p>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiOrgAvg}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-(--ink-primary) tabular-nums">
            {scopedAnalytics.orgAverageScore.toFixed(2)} <span className="text-sm font-medium text-(--ink-muted)">/ 5.0</span>
          </p>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiBiasAlerts}</p>
          <p
            className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums"
            style={{ color: scopedAnalytics.biasAlerts.length > 0 ? 'var(--status-low-text)' : 'var(--status-high-text)' }}
          >
            {scopedAnalytics.biasAlerts.length}
          </p>
        </div>
      </div>

      {/* 9-Box Grid (Spacious 8/12) + Compact Distribution & Bias Alerts (4/12) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8">
          <NineBoxGrid reviews={scopedReviews} t={t} lang={lang} onSelectReview={setSelectedReview} />
        </div>
        <div className="xl:col-span-4">
          <OrgDistributionBar
            distribution={scopedAnalytics.distribution}
            biasAlerts={scopedAnalytics.biasAlerts}
            t={t}
            lang={lang}
          />
        </div>
      </div>

      {/* SLA Breach & HRBP Intervention Queue (Full-Width) */}
      <ExceptionQueue
        reviews={scopedReviews}
        t={t}
        lang={lang}
        onNudge={onNudge}
        onOpenExtend={(rev) => setModalAction({ type: 'EXTEND', review: rev })}
        onOpenEscalate={(rev) => setModalAction({ type: 'ESCALATE', review: rev })}
        onOpenAdvisor={(rev) => setModalAction({ type: 'ADVISOR', review: rev })}
        onOpenApproveAmendment={(rev) => setModalAction({ type: 'AMEND_APPROVE', review: rev })}
        onOpenRejectAmendment={(rev) => setModalAction({ type: 'AMEND_REJECT', review: rev })}
      />

      {/* Scannable 6-Column Org Roster with Job Level Badges */}
      <section className="min-w-0 rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="hr-roster-heading" className="text-lg font-bold text-(--ink-primary)">{t.allEmployeesTitle}</h2>
          <span className="text-xs font-semibold text-(--ink-muted) tabular-nums">
            {t.cycleWeightsLabel}: What {cycle.whatWeight}% / How {cycle.howWeight}%
          </span>
        </div>
        <TableRegion labelledBy="hr-roster-heading">
          <table className="w-full text-left border-collapse">
            <caption className="visually-hidden">{t.allEmployeesTitle}</caption>
            <thead>
              <tr className="border-b border-(--border-subtle) bg-(--surface-subtle) text-xs font-bold uppercase text-(--ink-secondary)">
                <th scope="col" className="py-2.5 px-3">{t.colEmployee}</th>
                <th scope="col" className="py-2.5 px-3">{t.colDepartment}</th>
                <th scope="col" className="py-2.5 px-3">{t.colManager}</th>
                <th scope="col" className="py-2.5 px-3">{t.colStatus}</th>
                <th scope="col" className="py-2.5 px-3">{t.colScore}</th>
                <th scope="col" className="py-2.5 px-3 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle) text-sm">
              {scopedReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-(--surface-hover) transition-colors duration-150">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-(--ink-primary)">
                        {lang === 'th' ? rev.employee.nameTh : rev.employee.name}
                      </span>
                      <JobLevelBadge level={rev.employee.jobLevel} compact lang={lang} />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-(--ink-secondary)">{rev.employee.department}</td>
                  <td className="py-3 px-3 text-(--ink-secondary)">
                    {lang === 'th' ? rev.manager?.nameTh : rev.manager?.name}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge
                      tone={
                        rev.status === 'PUBLISHED'
                          ? 'high'
                          : rev.status === 'MANAGER_APPROVED'
                            ? 'indigo'
                            : ['GOAL_REVISION_REQUIRED', 'REVIEW_REVISION_REQUIRED'].includes(rev.status) || rev.isOverdue
                              ? 'warn'
                              : 'track'
                      }
                    >
                      {t.status[rev.status]}
                    </StatusBadge>
                  </td>
                  <td className="py-3 px-3 font-semibold text-(--ink-primary) tabular-nums">
                    {rev.overallScore != null
                      ? `${rev.overallScore.toFixed(2)} (${rev.whatPct?.toFixed(0)}% / ${rev.howScore?.toFixed(1)})`
                      : '—'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {rev.status === 'MANAGER_APPROVED' && canPublish && (
                        <button
                          type="button"
                          onClick={() => setModalAction({ type: 'HR_RETURN', review: rev })}
                          className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border text-xs font-semibold cursor-pointer"
                          style={{
                            backgroundColor: 'var(--status-warn-bg)',
                            color: 'var(--status-warn-text)',
                            borderColor: 'var(--status-warn-border)',
                          }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.hrReturnMgrBtn}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedReview(rev)}
                        className="min-h-10 px-3.5 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-xs font-semibold text-(--ink-primary) transition-colors duration-150 cursor-pointer"
                      >
                        {t.inspectBtn}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableRegion>
      </section>

      {/* Org-Scoped Activity Log — Always Anchored at Bottom */}
      <ActivityLogPanel logs={hrLogs} role="HR_ADMIN" t={t} />

      {selectedReview && (
        <EvaluationDrawer
          key={selectedReview.id}
          review={selectedReview}
          readOnly
          t={t}
          lang={lang}
          onClose={() => setSelectedReview(null)}
          onHrReturnToManager={
            canPublish && selectedReview.status === 'MANAGER_APPROVED'
              ? () => {
                  const target = selectedReview;
                  setSelectedReview(null);
                  setModalAction({ type: 'HR_RETURN', review: target });
                }
              : undefined
          }
        />
      )}

      {/* Publish Confirmation Dialog (Batch Summary + Lock Warning) */}
      <ModalDialog
        isOpen={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        labelledBy="hr-publish-confirm-title"
        panelClassName="max-w-lg rounded-lg border border-(--border-subtle) shadow-lg"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--status-track-bg)', color: 'var(--brand-primary)' }}
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2 id="hr-publish-confirm-title" className="text-lg font-bold text-(--ink-primary)">
                {t.publishConfirmTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPublishConfirm(false)}
              aria-label={t.cancelBtn}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-(--ink-primary) cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className="rounded-md border p-3.5 space-y-1.5"
              style={{
                backgroundColor: 'var(--status-high-bg)',
                borderColor: 'var(--status-high-border)',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--status-high-text)' }}>
                {t.publishConfirmReadyLabel}
              </p>
              <p className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--status-high-text)' }}>
                {readyToPublishCount}
              </p>
              <ul className="text-xs space-y-0.5 text-(--ink-primary)">
                {readyToPublishReviews.map((rev) => (
                  <li key={rev.id} className="truncate font-medium">
                    • {lang === 'th' ? rev.employee.nameTh : rev.employee.name} ({rev.employee.department})
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-md border p-3.5 space-y-1.5"
              style={{
                backgroundColor: inProgressReviews.length > 0 ? 'var(--status-warn-bg)' : 'var(--surface-subtle)',
                borderColor: inProgressReviews.length > 0 ? 'var(--status-warn-border)' : 'var(--border-subtle)',
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{
                  color: inProgressReviews.length > 0 ? 'var(--status-warn-text)' : 'var(--ink-secondary)',
                }}
              >
                {t.publishConfirmPendingLabel}
              </p>
              <p
                className="text-2xl font-extrabold tabular-nums"
                style={{
                  color: inProgressReviews.length > 0 ? 'var(--status-warn-text)' : 'var(--ink-primary)',
                }}
              >
                {inProgressReviews.length}
              </p>
              {inProgressReviews.length > 0 ? (
                <ul className="text-xs space-y-0.5 text-(--ink-secondary)">
                  {inProgressReviews.slice(0, 4).map((rev) => (
                    <li key={rev.id} className="truncate">
                      • {lang === 'th' ? rev.employee.nameTh : rev.employee.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-(--ink-secondary)">{t.publishConfirmAllReady}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-(--border-subtle) bg-(--surface-subtle) px-3.5 py-2.5 text-xs text-(--ink-secondary)">
            <Lock className="w-4 h-4 mt-0.5 shrink-0 text-(--ink-muted)" aria-hidden="true" />
            <p className="leading-relaxed">{t.publishConfirmLockNote}</p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowPublishConfirm(false)}
              className="min-h-11 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPublishConfirm(false);
                onPublishReady();
              }}
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white cursor-pointer tabular-nums"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{t.publishConfirmCta} ({readyToPublishCount})</span>
            </button>
          </div>
        </div>
      </ModalDialog>

      <ReasonModal
        isOpen={Boolean(modalAction)}
        title={
          modalAction?.type === 'EXTEND'
            ? `${t.extendBtn} — ${modalAction.review.employee.name}`
            : modalAction?.type === 'HR_RETURN'
              ? `${t.hrReturnMgrBtn} — ${modalAction.review.employee.name}`
              : modalAction?.type === 'ADVISOR'
                ? `${t.hrbpAdviseModalTitle} — ${modalAction.review.employee.name}`
                : modalAction?.type === 'AMEND_APPROVE'
                  ? `${t.amendApproveModalTitle} — ${modalAction.review.employee.name}`
                  : modalAction?.type === 'AMEND_REJECT'
                    ? `${t.amendRejectModalTitle} — ${modalAction.review.employee.name}`
                    : `${t.escalateBtn} — ${modalAction?.review.employee.name || ''}`
        }
        confirmLabel={
          modalAction?.type === 'EXTEND'
            ? t.confirmExtendBtn
            : modalAction?.type === 'HR_RETURN'
              ? t.confirmReturnMgrBtn
              : modalAction?.type === 'ADVISOR'
                ? t.confirmAdvisorBtn
                : modalAction?.type === 'AMEND_APPROVE'
                  ? t.amendApproveBtn
                  : modalAction?.type === 'AMEND_REJECT'
                    ? t.amendRejectBtn
                    : t.confirmEscalateBtn
        }
        quickTemplateLabel={modalAction?.type === 'ADVISOR' ? t.hrbpQuickTemplateLabel : ''}
        quickTemplateText={modalAction?.type === 'ADVISOR' ? t.hrbpQuickTemplateText : ''}
        showExtendDays={modalAction?.type === 'EXTEND'}
        defaultExtendDays={5}
        t={t}
        onClose={() => setModalAction(null)}
        onConfirm={(reason, extraDays) => {
          if (modalAction.type === 'EXTEND') {
            onExtendDeadline(modalAction.review.id, reason, extraDays);
          } else if (modalAction.type === 'HR_RETURN') {
            onHrReturnToManager(modalAction.review.id, reason);
          } else if (modalAction.type === 'ADVISOR') {
            onPostHrbpAdvisorComment(modalAction.review.id, reason);
          } else if (modalAction.type === 'AMEND_APPROVE') {
            onDecideGoalAmendment?.(modalAction.review.id, 'APPROVE', reason);
          } else if (modalAction.type === 'AMEND_REJECT') {
            onDecideGoalAmendment?.(modalAction.review.id, 'REJECT', reason);
          } else {
            onEscalate(modalAction.review.id, reason);
          }
          setModalAction(null);
        }}
      />
    </div>
  );
}
