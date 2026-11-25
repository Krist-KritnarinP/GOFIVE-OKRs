import { useEffect, useId, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  Lock,
  Pencil,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { EMPLOYEE_DEMO_SWITCHES } from '../constants/roles.js';
import { COMPETENCIES, NINE_BOX_CELLS, RUBRIC_LEVELS } from '../constants/rubric.js';
import { filterActivityLogsForRole } from '../constants/initialData.js';
import {
  STARTER_DEPARTMENTS,
  autoBalanceWeights,
  resolveStarterDepartmentId,
} from '../constants/okrTemplates.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { JobLevelBadge } from '../components/common/JobLevelBadge.jsx';
import { StageStatusBar } from '../components/common/StageStatusBar.jsx';
import { NextActionBanner } from '../components/common/NextActionBanner.jsx';
import { ReturnFeedbackCard } from '../components/common/ReturnFeedbackCard.jsx';
import { CommentHistoryPanel } from '../components/common/CommentHistoryPanel.jsx';
import { ActivityLogPanel } from '../components/common/ActivityLogPanel.jsx';
import { TieredSelect } from '../components/common/TieredSelect.jsx';
import { ModalDialog } from '../components/common/ModalDialog.jsx';
import { GoalEditorModal } from '../components/employee/GoalEditorModal.jsx';

const EMPLOYEE_SAFE_ACTIONS = new Set([
  'GOAL_SUBMITTED',
  'GOAL_APPROVED',
  'GOAL_REVISION_REQUESTED',
  'SELF_REVIEW_SUBMITTED',
  'REVIEW_REVISION_REQUESTED',
  'HRBP_ADVISOR_COMMENT',
  'PUBLISHED',
]);

const SCORE_TONE = {
  1: 'low',
  2: 'warn',
  3: 'neutral',
  4: 'track',
  5: 'high',
};

function loadDraftFromStorage(reviewId) {
  try {
    const raw = window.localStorage.getItem(`empeo-draft-${reviewId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function EmployeeWorkspacePage({
  cycle,
  reviews,
  auditLogs,
  activeEmployeeId,
  onSelectEmployee,
  t,
  lang,
  onSubmitGoals,
  onSubmitSelfReview,
  onNotify,
}) {
  const uid = useId();
  const review = reviews.find((r) => r.employeeId === activeEmployeeId) || reviews[0];
  const canEditGoals = ['GOAL_DRAFT', 'GOAL_REVISION_REQUIRED'].includes(review.status);
  const canFillSelfReview = ['GOAL_APPROVED', 'REVIEW_REVISION_REQUIRED'].includes(review.status);

  const savedDraft = loadDraftFromStorage(review.id);

  const [draftGoals, setDraftGoals] = useState(() =>
    canEditGoals && Array.isArray(savedDraft?.draftGoals) && savedDraft.draftGoals.length > 0
      ? savedDraft.draftGoals
      : review.goals || []
  );
  const [goalNote, setGoalNote] = useState(() => (canEditGoals ? savedDraft?.goalNote || '' : ''));
  const [goalModal, setGoalModal] = useState({ open: false, goal: null });
  const [showTemplates, setShowTemplates] = useState(() => (review.goals || []).length === 0);
  const [starterDeptId, setStarterDeptId] = useState(() =>
    resolveStarterDepartmentId(review.employee?.department)
  );
  const [showSubmitPreview, setShowSubmitPreview] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState(null);

  const [reflection, setReflection] = useState(
    () => (canFillSelfReview && savedDraft?.reflection) || review.selfPayload?.reflection || ''
  );
  const [goalInputs, setGoalInputs] = useState(() => {
    const base = Object.fromEntries(
      (review.goals || []).map((g) => {
        const existing = review.selfPayload?.goalAssessments?.find((a) => a.goalId === g.id);
        return [
          g.id,
          {
            actualValue: g.actualValue || '',
            progressPct: g.progressPct ?? 0,
            selfScore: existing?.selfScore ?? 3,
            selfEvidence: existing?.selfEvidence ?? '',
          },
        ];
      })
    );
    return canFillSelfReview && savedDraft?.goalInputs ? { ...base, ...savedDraft.goalInputs } : base;
  });

  const [compInputs, setCompInputs] = useState(() => {
    const base = Object.fromEntries(
      COMPETENCIES.map((c) => {
        const existing = review.selfPayload?.competencyAssessments?.find((a) => a.competencyId === c.id);
        return [
          c.id,
          {
            selfScore: existing?.selfScore ?? 3,
            selfNote: existing?.selfNote ?? '',
          },
        ];
      })
    );
    return canFillSelfReview && savedDraft?.compInputs ? { ...base, ...savedDraft.compInputs } : base;
  });

  // Auto-save active draft to localStorage so closing the tab never wipes work
  useEffect(() => {
    if (!canEditGoals && !canFillSelfReview) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          `empeo-draft-${review.id}`,
          JSON.stringify({ draftGoals, goalNote, goalInputs, compInputs, reflection })
        );
        setAutoSavedAt(new Date());
      } catch {
        // Ignore storage quota errors in restricted browsing modes.
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [review.id, canEditGoals, canFillSelfReview, draftGoals, goalNote, goalInputs, compInputs, reflection]);

  const clearSavedDraft = () => {
    try {
      window.localStorage.removeItem(`empeo-draft-${review.id}`);
    } catch {
      // Ignore storage errors.
    }
    setAutoSavedAt(null);
  };

  const displayedGoals = canEditGoals ? draftGoals : review.goals || [];
  const totalWeight = displayedGoals.reduce((acc, g) => acc + Number(g.weight || 0), 0);
  const cellInfo = NINE_BOX_CELLS.find((c) => c.id === review.nineBoxCell);
  const activeStarterDept =
    STARTER_DEPARTMENTS.find((d) => d.id === starterDeptId) || STARTER_DEPARTMENTS[0];

  // Strict privacy filter: unpublished internal manager/HR comments never shown to employee
  const safeCommentHistory =
    review.status === 'PUBLISHED'
      ? review.commentHistory || []
      : (review.commentHistory || []).filter((c) => EMPLOYEE_SAFE_ACTIONS.has(c.action));

  const employeeLogs = filterActivityLogsForRole(auditLogs, {
    role: 'EMPLOYEE',
    userId: review.employeeId,
  });

  const mgrName = lang === 'th' ? review.manager?.nameTh || review.manager?.name : review.manager?.name;

  // Single clear "Your Turn" guidance per status
  const bannerConfig = (() => {
    if (review.status === 'GOAL_DRAFT') {
      return { tone: 'action', badge: t.nextActionYourTurn, message: t.empBannerDraft };
    }
    if (review.status === 'GOAL_REVISION_REQUIRED') {
      return { tone: 'warn', badge: t.nextActionYourTurn, message: t.empBannerGoalReturn };
    }
    if (review.status === 'GOAL_PENDING_APPROVAL') {
      return {
        tone: 'done',
        badge: t.nextActionWaiting,
        message: t.empBannerGoalPending.replace('{mgr}', mgrName || ''),
      };
    }
    if (review.status === 'GOAL_APPROVED') {
      return { tone: 'action', badge: t.nextActionYourTurn, message: t.empBannerFillSelf };
    }
    if (review.status === 'REVIEW_REVISION_REQUIRED') {
      return { tone: 'warn', badge: t.nextActionYourTurn, message: t.empBannerRevReturn };
    }
    if (review.status === 'PUBLISHED') {
      return { tone: 'done', badge: t.nextActionDone, message: t.empBannerPublished };
    }
    return {
      tone: 'done',
      badge: t.nextActionWaiting,
      message: t.empBannerSelfPending.replace('{mgr}', mgrName || ''),
    };
  })();

  const handleSaveModalGoal = (goalObj) => {
    setDraftGoals((prev) => {
      const exists = prev.some((g) => g.id === goalObj.id);
      return exists ? prev.map((g) => (g.id === goalObj.id ? goalObj : g)) : [...prev, goalObj];
    });
  };

  const handleAddStarterTemplate = (tpl) => {
    const unitLabel = lang === 'th' ? tpl.unitTh : tpl.unit;
    const newGoal = {
      id: `g-tpl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title: tpl.title,
      titleTh: tpl.titleTh,
      metricType: tpl.metricType,
      targetValue: tpl.targetValue,
      unit: unitLabel,
      metric: `${tpl.targetValue} ${unitLabel}`,
      weight: tpl.weight,
      multiplier: tpl.multiplier,
      dueDate: '2026-11-30',
      actualValue: '',
      progressPct: 0,
    };
    setDraftGoals((prev) => [...prev, newGoal]);
    if (onNotify && t.starterAddedToast) {
      onNotify(
        t.starterAddedToast.replace('{title}', lang === 'th' ? tpl.titleTh : tpl.title),
        'success'
      );
    }
  };

  const handleAutoBalance = () => {
    if (draftGoals.length === 0) return;
    setDraftGoals((prev) => autoBalanceWeights(prev));
    if (onNotify && t.autoBalancedToast) {
      onNotify(t.autoBalancedToast, 'success');
    }
  };

  const handleDeleteGoal = (goalId) => {
    setDraftGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleConfirmSubmitGoals = () => {
    if (totalWeight !== 100 || draftGoals.length === 0) return;
    setShowSubmitPreview(false);
    clearSavedDraft();
    onSubmitGoals(review.id, draftGoals, goalNote);
    setGoalNote('');
  };

  const handleInsertEvidencePrompt = (goalId, promptText) => {
    setGoalInputs((prev) => {
      const current = prev[goalId] || {
        actualValue: '',
        progressPct: 0,
        selfScore: 3,
        selfEvidence: '',
      };
      const existingText = current.selfEvidence.trim();
      const nextText = existingText ? `${existingText}\n${promptText}` : promptText;
      return { ...prev, [goalId]: { ...current, selfEvidence: nextText } };
    });
  };

  const handleSubmitSelf = (e) => {
    e.preventDefault();
    const updatedGoals = (review.goals || []).map((g) => ({
      ...g,
      actualValue: goalInputs[g.id]?.actualValue ?? g.actualValue,
      progressPct: Number(goalInputs[g.id]?.progressPct ?? g.progressPct),
    }));
    clearSavedDraft();
    onSubmitSelfReview(
      review.id,
      {
        goalAssessments: updatedGoals.map((g) => ({
          goalId: g.id,
          actualValue: g.actualValue,
          progressPct: g.progressPct,
          selfScore: Number(goalInputs[g.id]?.selfScore ?? 3),
          selfEvidence: goalInputs[g.id]?.selfEvidence ?? '',
        })),
        competencyAssessments: COMPETENCIES.map((c) => ({
          competencyId: c.id,
          selfScore: Number(compInputs[c.id]?.selfScore ?? 3),
          selfNote: compInputs[c.id]?.selfNote ?? '',
        })),
        reflection,
      },
      updatedGoals
    );
  };

  const evidencePrompts = [
    { label: t.evidencePrompt1Label, text: t.evidencePrompt1Text },
    { label: t.evidencePrompt2Label, text: t.evidencePrompt2Text },
    { label: t.evidencePrompt3Label, text: t.evidencePrompt3Text },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-(--ink-primary)">
              {t.empTitle}
            </h1>
            <JobLevelBadge level={review.employee.jobLevel} lang={lang} />
          </div>
          <p className="text-sm sm:text-base text-(--ink-secondary) mt-0.5">{t.empSubtitle}</p>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-(--border-subtle) bg-(--surface-subtle) text-xs font-semibold text-(--ink-secondary)">
              <Building2 className="w-3.5 h-3.5 text-(--ink-muted)" aria-hidden="true" />
              <span>{review.employee.department}</span>
            </span>
            {review.manager && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-(--border-subtle) bg-(--surface-card) text-xs font-semibold text-(--ink-primary)">
                <UserCheck className="w-3.5 h-3.5 text-(--brand-primary)" aria-hidden="true" />
                <span className="text-(--ink-muted)">{t.reportingManagerLabel}:</span>
                <span>{lang === 'th' ? review.manager.nameTh : review.manager.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Employee Persona Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase text-(--ink-muted)">
            {t.empSwitchLabel}:
          </span>
          {EMPLOYEE_DEMO_SWITCHES.map((emp) => {
            const active = emp.userId === activeEmployeeId;
            return (
              <button
                key={emp.userId}
                type="button"
                onClick={() => onSelectEmployee(emp.userId)}
                className={`min-h-10 px-3 rounded-md border text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                  active
                    ? 'bg-(--brand-primary) border-(--brand-primary) text-white'
                    : 'bg-(--surface-card) border-(--border-strong) text-(--ink-primary) hover:bg-(--surface-hover)'
                }`}
              >
                {lang === 'th' ? emp.nameTh : emp.name} · {lang === 'th' ? emp.tagTh : emp.tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Single Plain-Language "Your Turn" Next-Action Banner */}
      <NextActionBanner
        tone={bannerConfig.tone}
        badgeLabel={bannerConfig.badge}
        message={bannerConfig.message}
      />

      {/* Live HR Reminder Banner (appears immediately when HR clicks Send Reminder) */}
      {review.lastNudgedAt && review.status !== 'PUBLISHED' && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--status-warn-bg)',
            borderColor: 'var(--status-warn-border)',
            color: 'var(--status-warn-text)',
          }}
        >
          <Bell className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider mr-2">
              {t.hrReminderBadge}
            </span>
            <span className="font-medium text-(--ink-primary)">
              {(t.hrReminderEmpText || '{hr} sent a reminder on {time}.')
                .replace('{hr}', lang === 'th' ? review.lastNudgedByTh || review.lastNudgedBy || 'HR' : review.lastNudgedBy || 'HR')
                .replace(
                  '{time}',
                  new Date(review.lastNudgedAt).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                )}
            </span>
          </div>
        </div>
      )}

      {/* 4-Stage Status Bar with Dates + Countdown / Overdue / Done Early Chips */}
      <StageStatusBar mode="review" cycle={cycle} review={review} t={t} lang={lang} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left (7 cols): Return Feedback Card + OKR Builder (Phase A) OR Self-Assessment (Phase B) + History */}
        <div className="xl:col-span-7 space-y-5">
          <ReturnFeedbackCard review={review} mode="employee" t={t} />

          <section className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-(--ink-primary)">{t.empGoalsTitle}</h2>
                <StatusBadge
                  tone={
                    review.status === 'PUBLISHED'
                      ? 'high'
                      : review.status === 'MANAGER_APPROVED'
                        ? 'indigo'
                        : ['GOAL_REVISION_REQUIRED', 'REVIEW_REVISION_REQUIRED'].includes(review.status) || review.isOverdue
                          ? 'warn'
                          : 'track'
                  }
                >
                  {t.status[review.status]}
                </StatusBadge>
                {autoSavedAt && (canEditGoals || canFillSelfReview) && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-(--status-high-text)">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.autoSavedLabel}
                  </span>
                )}
              </div>

              {canEditGoals && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowTemplates((v) => !v)}
                    aria-expanded={showTemplates}
                    className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-md border border-(--status-indigo-border) bg-(--status-indigo-bg) text-xs sm:text-sm font-semibold text-(--status-indigo-text) hover:brightness-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>{t.okrTemplatesBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalModal({ open: true, goal: null })}
                    className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>{t.addGoalBtn}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 1-Click Department Starter Templates Panel (Zero-Learning-Curve for Every Dept) */}
            {canEditGoals && showTemplates && (
              <div className="rounded-md border border-(--status-indigo-border) bg-(--status-indigo-bg) p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--status-indigo-text)' }}>
                    {t.starterTemplatesTitle}
                  </h3>
                  <p className="text-xs text-(--ink-secondary) mt-0.5">{t.starterTemplatesSub}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {STARTER_DEPARTMENTS.map((dept) => {
                    const active = dept.id === activeStarterDept.id;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setStarterDeptId(dept.id)}
                        className={`min-h-9 px-2.5 rounded-md border text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                          active
                            ? 'bg-(--brand-primary) border-(--brand-primary) text-white'
                            : 'bg-(--surface-card) border-(--border-strong) text-(--ink-primary) hover:bg-(--surface-hover)'
                        }`}
                      >
                        {lang === 'th' ? dept.labelTh : dept.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {activeStarterDept.templates.map((tpl, idx) => (
                    <div
                      key={`${activeStarterDept.id}-${idx}`}
                      className="rounded-md border border-(--border-subtle) bg-(--surface-card) px-3 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs sm:text-sm font-semibold text-(--ink-primary)">
                          {lang === 'th' ? tpl.titleTh : tpl.title}
                        </p>
                        <p className="text-xs text-(--ink-muted) tabular-nums">
                          {t.metricTypes?.[tpl.metricType] || tpl.metricType} · {t.targetLabel}:{' '}
                          {tpl.targetValue} {lang === 'th' ? tpl.unitTh : tpl.unit} · {tpl.weight}%
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddStarterTemplate(tpl)}
                        className="min-h-9 px-3 rounded-md border border-(--brand-primary) bg-(--status-track-bg) hover:bg-(--brand-primary) hover:text-white text-xs font-bold text-(--status-track-text) transition-colors duration-150 cursor-pointer shrink-0"
                      >
                        {t.starterAddBtn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ping-Pong >= 2 Calm 1-on-1 Alignment Recommendation */}
            {canEditGoals && (review.revisionRound || 1) >= 2 && (
              <div
                className="rounded-md border p-3.5 flex items-start gap-2.5 text-xs sm:text-sm"
                style={{
                  backgroundColor: 'var(--status-indigo-bg)',
                  borderColor: 'var(--status-indigo-border)',
                  color: 'var(--status-indigo-text)',
                }}
              >
                <Users className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="font-medium">
                  {t.pingPongBannerText.replace('{r}', review.revisionRound)}
                </p>
              </div>
            )}

            {/* Live Weight Counter Bar with 1-Click Auto-Balance 100% */}
            {canEditGoals && (
              <div
                className="rounded-md border p-3 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold tabular-nums"
                style={
                  totalWeight === 100
                    ? {
                        backgroundColor: 'var(--status-high-bg)',
                        color: 'var(--status-high-text)',
                        borderColor: 'var(--status-high-border)',
                      }
                    : {
                        backgroundColor: 'var(--status-warn-bg)',
                        color: 'var(--status-warn-text)',
                        borderColor: 'var(--status-warn-border)',
                      }
                }
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    {t.totalWeightLabel}: {totalWeight}% / 100%
                  </span>
                  {totalWeight !== 100 && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      {t.weightMustBe100}
                    </span>
                  )}
                </div>

                {totalWeight !== 100 && draftGoals.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-xs font-bold text-white cursor-pointer shrink-0"
                  >
                    <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.autoBalanceBtn}</span>
                  </button>
                )}
              </div>
            )}

            {/* OKR Cards or Welcoming 0-OKR Empty State */}
            <form onSubmit={handleSubmitSelf} className="space-y-4">
              {displayedGoals.length === 0 ? (
                <div className="rounded-md border border-dashed border-(--border-strong) bg-(--surface-subtle) p-6 text-center space-y-3">
                  <p className="text-base font-bold text-(--ink-primary)">{t.emptyOkrsTitle}</p>
                  <p className="text-sm text-(--ink-secondary) max-w-md mx-auto">{t.emptyOkrsDesc}</p>
                  {canEditGoals && (
                    <div className="flex items-center justify-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowTemplates(true)}
                        className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-md border border-(--status-indigo-border) bg-(--status-indigo-bg) text-sm font-semibold text-(--status-indigo-text) cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        <span>{t.okrTemplatesBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalModal({ open: true, goal: null })}
                        className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) active:scale-98 text-sm font-semibold text-white transition-[background-color,transform] duration-150 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>{t.addGoalBtn}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedGoals.map((goal) => {
                    const input = goalInputs[goal.id] || {
                      actualValue: goal.actualValue || '',
                      progressPct: goal.progressPct ?? 0,
                      selfScore: 3,
                      selfEvidence: '',
                    };
                    const metricLabel = t.metricTypes?.[goal.metricType] || goal.metricType || 'QUANTITATIVE';

                    return (
                      <div
                        key={goal.id}
                        className="rounded-md border border-(--border-subtle) bg-(--surface-subtle) p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-(--ink-primary)">
                              {lang === 'th' ? goal.titleTh : goal.title}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-(--ink-secondary) tabular-nums">
                              <span className="px-2 py-0.5 rounded bg-(--surface-card) border border-(--border-subtle) font-semibold">
                                {metricLabel}
                              </span>
                              <span>
                                {t.targetLabel}: <strong>{goal.targetValue || goal.metric} {goal.unit || ''}</strong>
                              </span>
                              <span>{t.weightLabel}: <strong>{goal.weight}%</strong></span>
                              <span>{t.multiplierLabel}: <strong>{goal.multiplier || 1.0}x</strong></span>
                              <span>{t.hitDateLabel}: <strong>{goal.dueDate || '—'}</strong></span>
                            </div>
                          </div>

                          {canEditGoals ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setGoalModal({ open: true, goal })}
                                className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-xs font-semibold text-(--ink-primary) cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                {t.editGoalBtn}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="inline-flex items-center gap-1 min-h-10 px-3 rounded-md border text-xs font-semibold cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--status-low-bg)',
                                  color: 'var(--status-low-text)',
                                  borderColor: 'var(--status-low-border)',
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                {t.deleteGoalBtn}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-(--ink-primary) tabular-nums shrink-0">
                              {goal.progressPct}%
                            </span>
                          )}
                        </div>

                        {!canEditGoals && (
                          <div className="h-2 w-full rounded bg-(--border-subtle) overflow-hidden">
                            <div
                              className="h-full"
                              style={{ width: `${goal.progressPct}%`, backgroundColor: 'var(--brand-primary)' }}
                            />
                          </div>
                        )}

                        {canFillSelfReview ? (
                          <div className="pt-2 border-t border-(--border-subtle) space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-(--ink-primary)">
                                  {t.actualAchievedLabel}
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={input.actualValue}
                                  onChange={(e) =>
                                    setGoalInputs((p) => ({
                                      ...p,
                                      [goal.id]: { ...input, actualValue: e.target.value },
                                    }))
                                  }
                                  placeholder="e.g. 92%"
                                  className="w-full min-h-10 rounded-md border border-(--border-strong) bg-(--surface-card) px-2.5 text-sm text-(--ink-primary)"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-(--ink-primary)">
                                  {t.progressPctLabel}
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  required
                                  value={input.progressPct}
                                  onChange={(e) =>
                                    setGoalInputs((p) => ({
                                      ...p,
                                      [goal.id]: { ...input, progressPct: e.target.value },
                                    }))
                                  }
                                  className="w-full min-h-10 rounded-md border border-(--border-strong) bg-(--surface-card) px-2.5 text-sm text-(--ink-primary) tabular-nums"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-xs font-semibold text-(--ink-primary)">
                                  {t.selfScoreLabel}
                                </label>
                                <TieredSelect
                                  ariaLabel={t.selfScoreLabel}
                                  value={input.selfScore}
                                  onChange={(e) =>
                                    setGoalInputs((p) => ({
                                      ...p,
                                      [goal.id]: { ...input, selfScore: Number(e.target.value) },
                                    }))
                                  }
                                  className="w-full tabular-nums"
                                  options={[1, 2, 3, 4, 5].map((n) => ({
                                    value: n,
                                    label: `${n} / 5`,
                                    tone: SCORE_TONE[n],
                                  }))}
                                />
                              </div>
                            </div>

                            {/* 3-Question Guided Evidence Prompt Chips */}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-medium text-(--ink-muted)">
                                  {t.evidencePromptsLabel}
                                </span>
                                {evidencePrompts.map((chip, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleInsertEvidencePrompt(goal.id, chip.text)}
                                    className="px-2 py-1 rounded border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-xs font-semibold text-(--brand-primary) cursor-pointer"
                                  >
                                    {chip.label}
                                  </button>
                                ))}
                              </div>
                              <textarea
                                rows={2}
                                required
                                value={input.selfEvidence}
                                onChange={(e) =>
                                  setGoalInputs((p) => ({
                                    ...p,
                                    [goal.id]: { ...input, selfEvidence: e.target.value },
                                  }))
                                }
                                placeholder={t.drawerEvidenceLabel}
                                className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary)"
                              />
                            </div>
                          </div>
                        ) : (
                          input.selfEvidence && (
                            <p className="text-xs text-(--ink-secondary)">
                              {goal.actualValue && <strong>{t.actualLabel}: {goal.actualValue} · </strong>}
                              &ldquo;{input.selfEvidence}&rdquo;
                            </p>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {canEditGoals && (
                <div className="pt-3 border-t border-(--border-subtle) space-y-3">
                  <textarea
                    rows={2}
                    value={goalNote}
                    onChange={(e) => setGoalNote(e.target.value)}
                    placeholder={t.goalNotePlaceholder}
                    className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary)"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={totalWeight !== 100 || draftGoals.length === 0}
                      onClick={() => setShowSubmitPreview(true)}
                      className="min-h-11 px-5 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) disabled:bg-(--surface-hover) disabled:text-(--ink-muted) text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed"
                    >
                      {review.status === 'GOAL_REVISION_REQUIRED' ? t.resubmitGoalsBtn : t.submitGoalsBtn}
                    </button>
                  </div>
                </div>
              )}

              {canFillSelfReview && (
                <div className="pt-4 border-t border-(--border-subtle) space-y-5">
                  {/* Core Competencies (How) Employee Self-Assessment */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-(--ink-primary)">{t.empCompSelfTitle}</h3>
                      <p className="text-xs text-(--ink-secondary) mt-0.5">{t.empCompSelfSub}</p>
                    </div>
                    <div className="space-y-3">
                      {COMPETENCIES.map((comp) => {
                        const cInput = compInputs[comp.id] || { selfScore: 3, selfNote: '' };
                        const rubric = RUBRIC_LEVELS[(cInput.selfScore || 3) - 1] || RUBRIC_LEVELS[2];
                        return (
                          <div
                            key={comp.id}
                            className="rounded-md border border-(--border-subtle) bg-(--surface-subtle) p-3.5 space-y-2.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <p className="text-sm font-bold text-(--ink-primary)">
                                {lang === 'th' ? comp.nameTh : comp.name}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[1, 2, 3, 4, 5].map((lvl) => {
                                  const active = Number(cInput.selfScore) === lvl;
                                  return (
                                    <button
                                      key={lvl}
                                      type="button"
                                      onClick={() =>
                                        setCompInputs((prev) => ({
                                          ...prev,
                                          [comp.id]: { ...cInput, selfScore: lvl },
                                        }))
                                      }
                                      aria-pressed={active}
                                      className={`min-w-9 min-h-9 px-2.5 rounded-md border text-xs font-bold tabular-nums transition-colors duration-150 cursor-pointer ${
                                        active
                                          ? 'bg-(--brand-primary) border-(--brand-primary) text-white'
                                          : 'bg-(--surface-card) border-(--border-strong) text-(--ink-primary) hover:bg-(--surface-hover)'
                                      }`}
                                    >
                                      {lvl}
                                    </button>
                                  );
                                })}
                                <span className="text-xs font-semibold text-(--ink-secondary) ml-1">
                                  {lang === 'th' ? rubric.labelTh : rubric.label}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-(--ink-secondary) border-l-2 border-(--brand-primary) pl-2.5">
                              {lang === 'th' ? rubric.anchorTh : rubric.anchor}
                            </p>
                            <textarea
                              rows={2}
                              value={cInput.selfNote}
                              onChange={(e) =>
                                setCompInputs((prev) => ({
                                  ...prev,
                                  [comp.id]: { ...cInput, selfNote: e.target.value },
                                }))
                              }
                              placeholder={t.empCompNotePlaceholder}
                              className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary)"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-(--ink-primary)">
                      {t.empReflectionLabel}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className="w-full rounded-md border border-(--border-strong) bg-(--surface-card) px-3 py-2 text-sm text-(--ink-primary)"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="min-h-11 px-5 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white cursor-pointer"
                    >
                      {t.empSubmitSelf}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </section>

          <CommentHistoryPanel history={safeCommentHistory} t={t} />
        </div>

        {/* Right (5 cols): Locked vs Published Result */}
        <div className="xl:col-span-5 space-y-5">
          <section className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 space-y-4">
            {review.status !== 'PUBLISHED' ? (
              <div className="flex flex-col items-start justify-center space-y-3 py-4">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-(--border-strong) bg-(--surface-subtle) text-(--ink-primary)">
                  <Lock className="w-5 h-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-bold text-(--ink-primary)">
                  {t.empResultsLockedTitle}
                </h2>
                <p className="text-sm text-(--ink-secondary)">{t.empResultsLockedDesc}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-(--ink-primary)">
                  {t.empResultsPublishedTitle}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-(--border-subtle) bg-(--surface-subtle) p-3.5">
                    <p className="text-xs font-semibold text-(--ink-secondary)">{t.empOverallScore}</p>
                    <p className="mt-1 text-2xl font-bold text-(--ink-primary) tabular-nums">
                      {review.overallScore?.toFixed(2)} / 5.0
                    </p>
                  </div>
                  <div
                    className="rounded-md border p-3.5"
                    style={{
                      backgroundColor: 'var(--status-high-bg)',
                      borderColor: 'var(--status-high-border)',
                      color: 'var(--status-high-text)',
                    }}
                  >
                    <p className="text-xs font-semibold">{t.empNineBoxTier}</p>
                    <p className="mt-1 text-sm font-bold">
                      {cellInfo ? (lang === 'th' ? cellInfo.labelTh : cellInfo.label) : '—'}
                    </p>
                  </div>
                  <div className="rounded-md border border-(--border-subtle) p-3">
                    <p className="text-xs text-(--ink-secondary)">{t.empWhatScore}</p>
                    <p className="mt-0.5 text-lg font-bold text-(--ink-primary) tabular-nums">
                      {review.whatPct?.toFixed(0)}% ({review.whatScore?.toFixed(1)}/5)
                    </p>
                  </div>
                  <div className="rounded-md border border-(--border-subtle) p-3">
                    <p className="text-xs text-(--ink-secondary)">{t.empHowScore}</p>
                    <p className="mt-0.5 text-lg font-bold text-(--ink-primary) tabular-nums">
                      {review.howScore?.toFixed(2)} / 5.0
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-(--border-subtle)">
                  <h3 className="text-sm font-bold text-(--ink-primary)">{t.empManagerFeedback}</h3>
                  <p className="text-sm text-(--ink-secondary)">
                    {review.managerPayload?.managerSummary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-(--ink-primary)">{t.empDevFocus}</h3>
                  <p className="text-sm text-(--ink-secondary)">
                    {review.managerPayload?.developmentFocus}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Own-Review Private Activity Log — Always Anchored at Bottom */}
      <ActivityLogPanel logs={employeeLogs} role="EMPLOYEE" t={t} />

      {goalModal.open && (
        <GoalEditorModal
          key={goalModal.goal?.id || 'new-goal'}
          isOpen={goalModal.open}
          initialGoal={goalModal.goal}
          t={t}
          onClose={() => setGoalModal({ open: false, goal: null })}
          onSave={handleSaveModalGoal}
        />
      )}

      {/* Preview & Confirm Dialog before Sending OKRs (reduces click anxiety for non-IT staff) */}
      <ModalDialog
        isOpen={showSubmitPreview}
        labelledBy={`${uid}-preview-title`}
        variant="center"
        maxWidthClass="max-w-lg"
        onClose={() => setShowSubmitPreview(false)}
      >
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h1 id={`${uid}-preview-title`} className="text-lg font-bold text-(--ink-primary)">
              {t.previewSubmitTitle}
            </h1>
            <p className="text-sm text-(--ink-secondary)">
              {t.previewSubmitSub.replace('{n}', String(draftGoals.length))}
            </p>
          </div>

          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {draftGoals.map((g, i) => (
              <li
                key={g.id}
                className="rounded-md border border-(--border-subtle) bg-(--surface-subtle) px-3 py-2.5 flex items-center justify-between gap-3 text-sm"
              >
                <span className="font-semibold text-(--ink-primary)">
                  {i + 1}. {lang === 'th' ? g.titleTh : g.title}
                </span>
                <span className="font-bold text-(--brand-primary) tabular-nums shrink-0">
                  {g.weight}%
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-(--border-subtle)">
            <button
              type="button"
              onClick={() => setShowSubmitPreview(false)}
              className="min-h-11 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) cursor-pointer"
            >
              {t.previewBackEditBtn}
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmitGoals}
              className="min-h-11 px-5 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white cursor-pointer"
            >
              {t.previewConfirmSendBtn}
            </button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
