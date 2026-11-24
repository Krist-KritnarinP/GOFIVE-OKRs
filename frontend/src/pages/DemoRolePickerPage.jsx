import { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Languages,
  Shield,
  UserCheck,
  Users,
  Briefcase,
  User,
} from 'lucide-react';
import { ROLES } from '../constants/roles.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';

const GROUP_CONFIG = [
  {
    id: ROLES.SUPER_ADMIN,
    icon: Shield,
    tone: 'track',
    labelEn: 'Super Admin',
    labelTh: 'ผู้ดูแลระบบสูงสุด (Super Admin)',
    descEn: 'Approve new accounts, assign roles, and control dynamic permission matrix.',
    descTh: 'อนุมัติพนักงานใหม่ กำหนดบทบาท และเปิด-ปิดสิทธิ์การเข้าถึงแต่ละตำแหน่ง',
    filter: (u) => u.accountStatus === 'ACTIVE' && u.role === ROLES.SUPER_ADMIN,
  },
  {
    id: ROLES.HR_ADMIN,
    icon: Users,
    tone: 'high',
    labelEn: 'HR Admin',
    labelTh: 'ฝ่ายบุคคล (HR Admin)',
    descEn: 'Oversee 9-Box Grid, detect manager bias, resolve overdue reviews, and publish results.',
    descTh: 'คุมภาพรวม 9-Box Grid ตรวจจับอคติการให้คะแนน จัดการเคสส่งช้า และประกาศผล',
    filter: (u) => u.accountStatus === 'ACTIVE' && u.role === ROLES.HR_ADMIN,
  },
  {
    id: ROLES.MANAGER,
    icon: Briefcase,
    tone: 'track',
    labelEn: 'Manager',
    labelTh: 'หัวหน้าทีม (Manager)',
    descEn: 'Evaluate direct reports with shared behavioral rubrics, evidence guardrails, and team benchmarks.',
    descTh: 'ประเมินลูกทีมด้วยเกณฑ์พฤติกรรมมาตรฐานกลาง แนบหลักฐาน และเทียบคะแนนทีมกับองค์กร',
    filter: (u) => u.accountStatus === 'ACTIVE' && u.role === ROLES.MANAGER,
  },
  {
    id: ROLES.EMPLOYEE,
    icon: User,
    tone: 'neutral',
    labelEn: 'Employee',
    labelTh: 'พนักงาน (Employee)',
    descEn: 'Draft annual OKRs, submit self-review, and inspect locked or published outcomes.',
    descTh: 'ตั้งเป้าหมาย OKR ประจำปี ส่งแบบประเมินตนเอง และดูผลเมื่อฝ่ายบุคคลประกาศ',
    filter: (u) => u.accountStatus === 'ACTIVE' && u.role === ROLES.EMPLOYEE,
  },
  {
    id: 'PENDING_NEW',
    icon: Clock,
    tone: 'warn',
    labelEn: 'New Employee (Pending Approval)',
    labelTh: 'พนักงานใหม่รออนุมัติ (Pending)',
    descEn: 'Newly registered staff awaiting Super Admin approval to become HR Admin, Manager, or Employee.',
    descTh: 'พนักงานใหม่ที่ลงทะเบียนไว้ รอ Super Admin อนุมัติเป็น HR Admin, Manager หรือ Employee',
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
}) {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const selectedGroup = GROUP_CONFIG.find((g) => g.id === selectedGroupId) || null;
  const groupUsers = selectedGroup ? users.filter(selectedGroup.filter) : [];
  const superAdminUser = users.find((u) => u.role === ROLES.SUPER_ADMIN && u.accountStatus === 'ACTIVE');

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--surface-page)] text-[var(--ink-primary)]">
      {/* Static Header — Text-only empeo wordmark */}
      <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold tracking-tight text-[var(--ink-primary)]">
              {t.appName}
            </span>
            <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--ink-secondary)]">
              {t.demoPickerBadge}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>{t.backToLogin}</span>
            </button>
            <button
              type="button"
              onClick={onToggleLanguage}
              className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer"
            >
              <Languages className="w-4 h-4 text-[var(--ink-secondary)]" aria-hidden="true" />
              <span>{t.switchLanguage}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb / Step Indicator */}
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-secondary)]">
            <button
              type="button"
              onClick={() => setSelectedGroupId(null)}
              className={`cursor-pointer hover:underline ${
                !selectedGroup ? 'text-[var(--brand-primary)]' : 'text-[var(--ink-secondary)]'
              }`}
            >
              1. {t.demoStep1Role}
            </button>
            <ChevronRight className="w-4 h-4 text-[var(--ink-muted)]" aria-hidden="true" />
            <span className={selectedGroup ? 'text-[var(--brand-primary)]' : 'text-[var(--ink-muted)]'}>
              2. {selectedGroup ? (lang === 'th' ? selectedGroup.labelTh : selectedGroup.labelEn) : t.demoStep2Person}
            </span>
          </div>

          {!selectedGroup ? (
            /* LEVEL 1: Select Role Group */
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
                  {t.demoPickerTitle}
                </h1>
                <p className="mt-1 text-sm sm:text-base text-[var(--ink-secondary)]">
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
                      className="text-left rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--brand-primary)] hover:bg-[var(--surface-hover)] p-5 flex flex-col justify-between gap-4 transition-colors duration-150 cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--ink-primary)]">
                            <Icon className="w-5 h-5" aria-hidden="true" />
                          </span>
                          <StatusBadge tone={group.tone}>
                            {count} {count === 1 ? t.userCountSingle : t.userCountPlural}
                          </StatusBadge>
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-[var(--ink-primary)]">
                            {lang === 'th' ? group.labelTh : group.labelEn}
                          </h2>
                          <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                            {lang === 'th' ? group.descTh : group.descEn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-sm font-semibold text-[var(--brand-primary)]">
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
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
                    {lang === 'th' ? selectedGroup.labelTh : selectedGroup.labelEn}
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-[var(--ink-secondary)]">
                    {selectedGroup.id === 'PENDING_NEW'
                      ? t.demoPendingHint
                      : t.demoSelectPersonSubtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGroupId(null)}
                  className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] transition-colors duration-150 cursor-pointer self-start"
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
                    className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white transition-colors duration-150 cursor-pointer shrink-0"
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
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wide text-[var(--ink-muted)] tabular-nums">
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
                          <h2 className="text-lg font-bold text-[var(--ink-primary)]">
                            {lang === 'th' ? person.nameTh : person.name}
                          </h2>
                          <p className="text-sm text-[var(--ink-secondary)]">
                            {person.title} · {person.department}
                          </p>
                        </div>

                        {isPending && (
                          <p className="text-xs text-[var(--ink-muted)]">
                            {t.demoSuggestedRole}: <strong>{t.roleLabels?.[person.role] || person.role}</strong>
                          </p>
                        )}
                      </div>

                      {!isPending ? (
                        <button
                          type="button"
                          onClick={() => onEnterAsUser(person)}
                          className="w-full min-h-11 px-4 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer"
                        >
                          <span>{t.demoEnterDashboardBtn}</span>
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => superAdminUser && onEnterAsUser(superAdminUser)}
                          className="w-full min-h-11 px-4 rounded-md border border-[var(--border-strong)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-sm font-semibold text-[var(--ink-primary)] inline-flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer"
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
    </div>
  );
}
