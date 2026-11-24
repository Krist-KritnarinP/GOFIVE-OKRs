import { useState } from 'react';
import { Clock, Lock, RotateCcw, Send, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
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
  can,
  t,
  lang,
  onToggleGracePeriod,
  onToggleLockCycle,
  onNudge,
  onExtendDeadline,
  onEscalate,
  onHrReturnToManager,
  onLockCalibration,
  onPublishReady,
  onSaveEvaluation,
}) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  const canConfigure = can ? can('cycle:configure') : true;
  const canPublish = can ? can('review:publish') : true;

  const completed = reviews.filter((r) =>
    ['MANAGER_APPROVED', 'CALIBRATION_LOCKED', 'PUBLISHED'].includes(r.status)
  ).length;
  const completionPct = reviews.length > 0 ? Math.round((completed / reviews.length) * 100) : 0;
  const overdueCount = reviews.filter((r) => r.isOverdue).length;
  const pendingCalibrationCount = reviews.filter((r) => r.status === 'MANAGER_APPROVED').length;
  const readyToPublishCount = reviews.filter((r) => r.status === 'CALIBRATION_LOCKED').length;

  return (
    <div className="w-full space-y-6">
      {/* Header & Operational Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
            {t.hrTitle}
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-secondary)] mt-0.5">{t.hrSubtitle}</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            disabled={!canConfigure}
            onClick={onToggleGracePeriod}
            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            <Clock className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
            <span>{t.graceToggleLabel}: {cycle.isGracePeriodActive ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            disabled={!canConfigure}
            onClick={onToggleLockCycle}
            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
            <span>{t.lockToggleLabel}: {cycle.isLocked ? 'ON' : 'OFF'}</span>
          </button>

          {/* Calibration Lock Gate */}
          <button
            type="button"
            disabled={pendingCalibrationCount === 0 || !canPublish}
            onClick={onLockCalibration}
            className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed tabular-nums"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
            <span>{t.lockCalibrationCta} ({pendingCalibrationCount})</span>
          </button>

          {/* Primary CTA: Publish ONLY Calibration-Locked Results */}
          <button
            type="button"
            disabled={readyToPublishCount === 0 || !canPublish}
            onClick={onPublishReady}
            title={!canPublish ? t.permDeniedBanner : undefined}
            className="inline-flex items-center gap-2 min-h-11 px-4 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)] disabled:border disabled:border-[var(--border-subtle)] text-sm font-semibold text-white transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed tabular-nums"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{t.publishAllCta} ({readyToPublishCount})</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiCompletion}</p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)] tabular-nums">
            {completionPct}% <span className="text-sm font-normal text-[var(--ink-muted)]">({completed}/{reviews.length})</span>
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiOverdue}</p>
          <p
            className="mt-1.5 text-2xl font-bold tabular-nums"
            style={{ color: overdueCount > 0 ? 'var(--status-warn-text)' : 'var(--status-high-text)' }}
          >
            {overdueCount}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiOrgAvg}</p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)] tabular-nums">
            {analytics.orgAverageScore.toFixed(2)} <span className="text-sm font-normal text-[var(--ink-muted)]">/ 5.0</span>
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiBiasAlerts}</p>
          <p
            className="mt-1.5 text-2xl font-bold tabular-nums"
            style={{ color: analytics.biasAlerts.length > 0 ? 'var(--status-low-text)' : 'var(--status-high-text)' }}
          >
            {analytics.biasAlerts.length}
          </p>
        </div>
      </div>

      {/* 9-Box Grid + Distribution & Bias Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <NineBoxGrid reviews={reviews} t={t} lang={lang} onSelectReview={setSelectedReview} />
        </div>
        <div className="xl:col-span-5">
          <OrgDistributionBar
            distribution={analytics.distribution}
            biasAlerts={analytics.biasAlerts}
            t={t}
            lang={lang}
          />
        </div>
      </div>

      {/* Exception Queue + Audit Log */}
      <ExceptionQueue
        reviews={reviews}
        auditLogs={auditLogs}
        t={t}
        lang={lang}
        onNudge={onNudge}
        onOpenExtend={(rev) => setModalAction({ type: 'EXTEND', review: rev })}
        onOpenEscalate={(rev) => setModalAction({ type: 'ESCALATE', review: rev })}
      />

      {/* Scannable 6-Column Org Roster (with HR Calibration Return action) */}
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.allEmployeesTitle}</h2>
          <span className="text-xs font-semibold text-[var(--ink-muted)] tabular-nums">
            {t.cycleWeightsLabel}: What {cycle.whatWeight}% / How {cycle.howWeight}%
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs font-bold uppercase text-[var(--ink-secondary)]">
                <th className="py-2.5 px-3">{t.colEmployee}</th>
                <th className="py-2.5 px-3">{t.colDepartment}</th>
                <th className="py-2.5 px-3">{t.colManager}</th>
                <th className="py-2.5 px-3">{t.colStatus}</th>
                <th className="py-2.5 px-3">{t.colScore}</th>
                <th className="py-2.5 px-3 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150">
                  <td className="py-3 px-3 font-semibold text-[var(--ink-primary)]">
                    {lang === 'th' ? rev.employee.nameTh : rev.employee.name}
                  </td>
                  <td className="py-3 px-3 text-[var(--ink-secondary)]">{rev.employee.department}</td>
                  <td className="py-3 px-3 text-[var(--ink-secondary)]">
                    {lang === 'th' ? rev.manager?.nameTh : rev.manager?.name}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge
                      tone={
                        rev.status === 'PUBLISHED'
                          ? 'high'
                          : ['GOAL_REVISION_REQUIRED', 'REVIEW_REVISION_REQUIRED'].includes(rev.status) || rev.isOverdue
                            ? 'warn'
                            : 'track'
                      }
                    >
                      {t.status[rev.status]}
                    </StatusBadge>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--ink-primary)] tabular-nums">
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
                          className="inline-flex items-center gap-1 min-h-9 px-2.5 rounded-md border text-xs font-semibold cursor-pointer"
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
                        className="min-h-9 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
                      >
                        {t.inspectBtn}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedReview && (
        <EvaluationDrawer
          key={selectedReview.id}
          review={selectedReview}
          readOnly={false}
          t={t}
          lang={lang}
          onClose={() => setSelectedReview(null)}
          onSave={onSaveEvaluation}
        />
      )}

      <ReasonModal
        isOpen={Boolean(modalAction)}
        title={
          modalAction?.type === 'EXTEND'
            ? `${t.extendBtn} — ${modalAction.review.employee.name}`
            : modalAction?.type === 'HR_RETURN'
              ? `${t.hrReturnMgrBtn} — ${modalAction.review.employee.name}`
              : `${t.escalateBtn} — ${modalAction?.review.employee.name || ''}`
        }
        t={t}
        onClose={() => setModalAction(null)}
        onConfirm={(reason) => {
          if (modalAction.type === 'EXTEND') {
            onExtendDeadline(modalAction.review.id, reason);
          } else if (modalAction.type === 'HR_RETURN') {
            onHrReturnToManager(modalAction.review.id, reason);
          } else {
            onEscalate(modalAction.review.id, reason);
          }
          setModalAction(null);
        }}
      />
    </div>
  );
}
