import { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Languages,
  RotateCcw,
  Shield,
  UserCheck,
  Users,
  Briefcase,
  User,
  X,
} from 'lucide-react';
import { ROLES } from '../constants/roles.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { ModalDialog } from '../components/common/ModalDialog.jsx';

const GROUP_CONFIG = [
  {
    id: ROLES.SUPER_ADMIN,
    icon: Shield,
    tone: 'track',
    labelEn: 'Super Admin',
    labelTh: 'ผู้ดูแลระบบสูงสุด',
    descEn: 'Approve new accounts, assign roles, and control dynamic permission matrix.',
    descTh: 'อนุมัติพนักงานใหม่ กำหนดบทบาท และเปิด-ปิดสิทธิ์การเข้าถึงแต่ละตำแหน่ง',
    filter: (u) => u.accountStatus === 'ACTIVE' && u.role === ROLES.SUPER_ADMIN,
  },
  {
    id: ROLES.HR_ADMIN,
    icon: Users,
    tone: 'high',
    labelEn: 'HR Admin',
    labelTh: 'ฝ่ายบุคคล',
    descEn: 'Oversee Impact & Competency Map, detect manager bias, resolve overdue reviews, and publish results.',
    descTh: 'คุมภาพรวมแผนผังผลลัพธ์และสมรรถนะ ตรวจจับอคติการให้คะแนน จัดการรายการส่งช้า และประกาศผล',
    filter: (u) => u.accountStatus === 'ACTIVE' && u.role === ROLES.HR_ADMIN,
  },
  {
    id: ROLES.MANAGER,
    icon: Briefcase,
    tone: 'track',
    labelEn: 'Manager',
    labelTh: 'หัวหน้าทีม',
    descEn: 'Evaluate direct reports with shared behavioral rubrics, evidence guardrails, and team benchmarks.',
    descTh: 'ประเมินลูกทีมด้วยเกณฑ์พฤติกรรมมาตรฐานกลาง แนบหลักฐาน และเทียบคะแนนทีมกับองค์กร',
    filter: (u) => u.accountStatus === 'ACTIVE' && u.role === ROLES.MANAGER,
  },
  {
    id: ROLES.EMPLOYEE,
    icon: User,
    tone: 'neutral',
    labelEn: 'Employee',
    labelTh: 'พนักงาน',
    descEn: 'Draft annual OKRs, submit self-review, and inspect locked or published outcomes.',
    descTh: 'ตั้งเป้าหมาย OKR ประจำปี ส่งแบบประเมินตนเอง และดูผลเมื่อฝ่ายบุคคลประกาศ',
    filter: (u) => u.accountStatus === 'ACTIVE' && u.role === ROLES.EMPLOYEE,
  },
  {
    id: 'PENDING_NEW',
    icon: Clock,
    tone: 'warn',
    labelEn: 'New Employee (Pending Approval)',
    labelTh: 'พนักงานใหม่รออนุมัติ',
    descEn: 'Newly registered staff awaiting Super Admin approval to become HR Admin, Manager, or Employee.',
    descTh: 'พนักงานใหม่ที่ลงทะเบียนไว้ รอผู้ดูแลระบบอนุมัติเป็นฝ่ายบุคคล หัวหน้าทีม หรือพนักงาน',
    filter: (u) => u.accountStatus === 'PENDING_APPROVAL',
  },
];

export function DemoRolePickerPage({
  users,
  reviews,
  t,
  lang,
  onToggleLanguage,
  onEnterAsUser,
  onBackToLogin,
  onResetDemo,
}) {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const selectedGroup = GROUP_CONFIG.find((g) => g.id === selectedGroupId) || null;
  const groupUsers = selectedGroup ? users.filter(selectedGroup.filter) : [];
  const superAdminUser = users.find((u) => u.role === ROLES.SUPER_ADMIN && u.accountStatus === 'ACTIVE');

  return (
    <div className="min-h-screen w-full flex flex-col bg-(--surface-page) text-(--ink-primary)">
      {/* Static Header — Text-only empeo wordmark */}
      <header className="w-full border-b border-(--border-subtle) bg-(--surface-card)">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold tracking-tight text-(--ink-primary)">
              {t.appName}
            </span>
            <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md border border-(--border-subtle) bg-(--surface-subtle) text-(--ink-secondary) tabular-nums">
              {String(t.demoPickerBadge || '').replace('16', String(users.length))}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onResetDemo && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-secondary) hover:text-(--ink-primary) transition-colors duration-150 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>{t.resetDemoBtn}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) transition-colors duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>{t.backToLogin}</span>
            </button>
            <button
              type="button"
              onClick={onToggleLanguage}
              className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) transition-colors duration-150 cursor-pointer"
            >
              <Languages className="w-4 h-4 text-(--ink-secondary)" aria-hidden="true" />
              <span>{t.switchLanguage}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb / Step Indicator */}
          <div className="flex items-center gap-2 text-sm font-semibold text-(--ink-secondary)">
            <button
              type="button"
              onClick={() => setSelectedGroupId(null)}
              className={`cursor-pointer hover:underline ${
                !selectedGroup ? 'text-(--brand-primary)' : 'text-(--ink-secondary)'
              }`}
            >
              1. {t.demoStep1Role}
            </button>
            <ChevronRight className="w-4 h-4 text-(--ink-muted)" aria-hidden="true" />
            <span className={selectedGroup ? 'text-(--brand-primary)' : 'text-(--ink-muted)'}>
              2. {selectedGroup ? (lang === 'th' ? selectedGroup.labelTh : selectedGroup.labelEn) : t.demoStep2Person}
            </span>
          </div>

          {!selectedGroup ? (
            /* LEVEL 1: Select Role Group */
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-(--ink-primary)">
                  {t.demoPickerTitle}
                </h1>
                <p className="mt-1 text-sm sm:text-base text-(--ink-secondary)">
                  {t.demoPickerSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {GROUP_CONFIG.map((group) => {
                  const Icon = group.icon;
                  const count = users.filter(group.filter).length;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroupId(group.id)}
                      className="text-left rounded-lg border border-(--border-subtle) bg-(--surface-card) hover:border-(--brand-primary) hover:bg-(--surface-hover) p-5 flex flex-col justify-between gap-4 transition-colors duration-150 cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-(--border-subtle) bg-(--surface-subtle) text-(--ink-primary)">
                            <Icon className="w-5 h-5" aria-hidden="true" />
                          </span>
                          <StatusBadge tone={group.tone}>
                            {count} {count === 1 ? t.userCountSingle : t.userCountPlural}
                          </StatusBadge>
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-(--ink-primary)">
                            {lang === 'th' ? group.labelTh : group.labelEn}
                          </h2>
                          <p className="mt-1 text-sm text-(--ink-secondary)">
                            {lang === 'th' ? group.descTh : group.descEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-(--border-subtle) text-sm font-semibold text-(--brand-primary)">
                        <span>{t.demoSelectRoleCta}</span>
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LEVEL 2: Select Specific Person inside Chosen Role */
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-(--ink-primary)">
                    {lang === 'th' ? selectedGroup.labelTh : selectedGroup.labelEn}
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-(--ink-secondary)">
                    {selectedGroup.id === 'PENDING_NEW'
                      ? t.demoPendingHint
                      : t.demoSelectPersonSubtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGroupId(null)}
                  className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) transition-colors duration-150 cursor-pointer self-start"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>{t.demoBackToRoles}</span>
                </button>
              </div>

              {selectedGroup.id === 'PENDING_NEW' && superAdminUser && (
                <div
                  className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--status-warn-bg)',
                    borderColor: 'var(--status-warn-border)',
                    color: 'var(--status-warn-text)',
                  }}
                >
                  <p className="text-sm font-semibold">{t.demoPendingApprovePrompt}</p>
                  <button
                    type="button"
                    onClick={() => onEnterAsUser(superAdminUser)}
                    className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white transition-colors duration-150 cursor-pointer shrink-0"
                  >
                    <UserCheck className="w-4 h-4" aria-hidden="true" />
                    <span>{t.demoGoSuperAdminBtn}</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupUsers.map((person, index) => {
                  const review = reviews.find((r) => r.employeeId === person.id);
                  const isPending = person.accountStatus === 'PENDING_APPROVAL';
                  const slotLabel =
                    selectedGroup.id === 'PENDING_NEW'
                      ? `${t.newEmployeeSlot} ${index + 1}`
                      : `${lang === 'th' ? selectedGroup.labelTh : selectedGroup.labelEn} ${index + 1}`;

                  return (
                    <div
                      key={person.id}
                      className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wide text-(--ink-muted) tabular-nums">
                            {slotLabel} · {person.employeeCode}
                          </span>
                          {isPending ? (
                            <StatusBadge tone="warn">
                              {t.accountStatusLabels?.PENDING_APPROVAL || 'Pending Approval'}
                            </StatusBadge>
                          ) : review ? (
                            <StatusBadge
                              tone={
                                review.status === 'PUBLISHED'
                                  ? 'high'
                                  : review.isOverdue
                                    ? 'warn'
                                    : 'track'
                              }
                            >
                              {review.isOverdue
                                ? `${review.daysOverdue} ${t.daysOverdue}`
                                : t.status[review.status]}
                            </StatusBadge>
                          ) : (
                            <StatusBadge tone="high">
                              {t.accountStatusLabels?.ACTIVE || 'Active'}
                            </StatusBadge>
                          )}
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-(--ink-primary)">
                            {lang === 'th' ? person.nameTh : person.name}
                          </h2>
                          <p className="text-sm text-(--ink-secondary)">
                            {person.title} · {person.department}
                          </p>
                        </div>

                        {isPending && (
                          <p className="text-xs text-(--ink-muted)">
                            {t.demoSuggestedRole}: <strong>{t.roleLabels?.[person.role] || person.role}</strong>
                          </p>
                        )}
                      </div>

                      {!isPending ? (
                        <button
                          type="button"
                          onClick={() => onEnterAsUser(person)}
                          className="w-full min-h-11 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer"
                        >
                          <span>{t.demoEnterDashboardBtn}</span>
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => superAdminUser && onEnterAsUser(superAdminUser)}
                          className="w-full min-h-11 px-4 rounded-md border border-(--border-strong) bg-(--surface-subtle) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) inline-flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer"
                        >
                          <span>{t.demoApproveAsSuperBtn}</span>
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <ModalDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        labelledBy="picker-reset-demo-title"
        panelClassName="max-w-md rounded-lg border border-(--border-subtle) shadow-lg"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 id="picker-reset-demo-title" className="text-lg font-bold text-(--ink-primary)">
              {t.resetDemoConfirmTitle}
            </h2>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              aria-label={t.cancelBtn}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-(--ink-primary) cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm leading-relaxed text-(--ink-secondary)">{t.resetDemoConfirmDesc}</p>
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="min-h-10 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResetConfirm(false);
                setSelectedGroupId(null);
                onResetDemo?.();
              }}
              className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t.resetDemoConfirmCta}</span>
            </button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
