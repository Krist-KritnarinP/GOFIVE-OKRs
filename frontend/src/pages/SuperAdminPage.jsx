import { useId, useState } from 'react';
import { AlertCircle, Check, Copy, Lock, UserCheck, UserPlus, X } from 'lucide-react';
import { JOB_LEVELS, PERMISSION_CATALOG, ROLES } from '../constants/roles.js';
import { filterActivityLogsForRole } from '../constants/initialData.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { TableRegion } from '../components/common/TableRegion.jsx';
import { ActivityLogPanel } from '../components/common/ActivityLogPanel.jsx';
import { TieredSelect } from '../components/common/TieredSelect.jsx';
import { ModalDialog } from '../components/common/ModalDialog.jsx';

const DEPARTMENT_OPTIONS = [
  { value: 'Engineering', label: 'Engineering', tone: 'track' },
  { value: 'Product', label: 'Product', tone: 'indigo' },
  { value: 'Sales', label: 'Sales', tone: 'high' },
  { value: 'Operations', label: 'Operations', tone: 'warn' },
  { value: 'Human Resources', label: 'Human Resources', tone: 'neutral' },
];

const ROLE_COLUMNS = [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE];

const ROLE_TONE = {
  SUPER_ADMIN: 'low',
  HR_ADMIN: 'indigo',
  MANAGER: 'track',
  EMPLOYEE: 'neutral',
};

const ROLE_TIER_PREFIX = {
  SUPER_ADMIN: 'T4',
  HR_ADMIN: 'T3',
  MANAGER: 'T2',
  EMPLOYEE: 'T1',
};

export function SuperAdminPage({
  users,
  rolePermissions,
  auditLogs = [],
  t,
  lang,
  onInviteUser,
  onUpdateUser,
  onTogglePermission,
}) {
  const uid = useId();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    employeeCode: 'EMP-3095',
    name: '',
    department: 'Engineering',
    title: '',
    role: ROLES.EMPLOYEE,
    jobLevel: 'L1_JUNIOR',
    managerId: 'usr-mgr-eng',
  });
  const [inviteError, setInviteError] = useState('');
  const [createdInvite, setCreatedInvite] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const activeManagers = users.filter((u) => u.role === ROLES.MANAGER && u.accountStatus === 'ACTIVE');
  const pendingUsers = users.filter((u) => u.accountStatus === 'PENDING_APPROVAL');
  const activeCount = users.filter((u) => u.accountStatus === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.accountStatus === 'SUSPENDED').length;

  const superLogs = filterActivityLogsForRole(auditLogs, {
    role: 'SUPER_ADMIN',
    userId: 'usr-super',
  });

  const openInviteModal = () => {
    const existingNums = users
      .map((u) => Number(String(u.employeeCode || '').replace(/\D/g, '')))
      .filter((n) => Number.isFinite(n));
    const nextNum = Math.max(3095, ...existingNums) + 1;
    setInviteForm({
      employeeCode: `EMP-${nextNum}`,
      name: '',
      department: 'Engineering',
      title: '',
      role: ROLES.EMPLOYEE,
      jobLevel: 'L1_JUNIOR',
      managerId: activeManagers[0]?.id || 'usr-mgr-eng',
    });
    setInviteError('');
    setCreatedInvite(null);
    setInviteOpen(true);
  };

  const handleSubmitInvite = (e) => {
    e.preventDefault();
    setInviteError('');
    if (!/^[A-Z]{2,6}-\d{3,6}$/i.test(inviteForm.employeeCode.trim())) {
      setInviteError(t.regErrCodeFormat || 'Employee code format must be e.g. EMP-3095.');
      return;
    }
    const res = onInviteUser(inviteForm);
    if (!res.ok) {
      setInviteError(res.error);
      return;
    }
    setCreatedInvite(res.user);
  };

  const handleCopyInvite = (user) => {
    const text = `Employee Code: ${user.employeeCode} | Invite Code: ${user.inviteCode}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(user.id);
    window.setTimeout(() => setCopiedId((curr) => (curr === user.id ? null : curr)), 2000);
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--ink-primary)">
            {t.superTitle}
          </h1>
          <p className="text-sm sm:text-base text-(--ink-secondary) mt-0.5">{t.superSubtitle}</p>
        </div>
        {onInviteUser && (
          <button
            type="button"
            onClick={openInviteModal}
            className="inline-flex items-center gap-2 min-h-11 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white transition-colors duration-150 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>+ {t.inviteEmployeeBtn}</span>
          </button>
        )}
      </div>

      {/* 4 Governance KPI Summary Cards — Decided Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiActiveAccounts}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-(--ink-primary) tabular-nums">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiPendingApprovals}</p>
          <p
            className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums"
            style={{ color: pendingUsers.length > 0 ? 'var(--status-warn-text)' : 'var(--status-high-text)' }}
          >
            {pendingUsers.length}
          </p>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiSuspendedAccounts}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-(--ink-primary) tabular-nums">{suspendedCount}</p>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--surface-card) p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-(--ink-muted)">{t.kpiAuditEvents}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-(--ink-primary) tabular-nums">{superLogs.length}</p>
        </div>
      </div>

      {/* Pending Registration Approvals (Full-Width) */}
      <section className="min-w-0 rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-(--ink-primary)">{t.pendingApprovalsTitle}</h2>
          <StatusBadge tone={pendingUsers.length > 0 ? 'warn' : 'high'}>
            {pendingUsers.length}
          </StatusBadge>
        </div>

        {pendingUsers.length === 0 ? (
          <p className="text-sm text-(--ink-secondary)">{t.noPendingApprovals}</p>
        ) : (
          <div className="space-y-2.5">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-(--status-warn-border) bg-(--status-warn-bg) p-4"
              >
                <div>
                  <p className="text-sm font-bold text-(--ink-primary) tabular-nums">
                    {user.employeeCode} · {lang === 'th' ? user.nameTh : user.name}
                  </p>
                  <p className="text-xs text-(--ink-secondary)">
                    {user.title} · {user.department}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <TieredSelect
                    ariaLabel={`Assign job level for ${user.employeeCode}`}
                    value={user.jobLevel || 'L1_JUNIOR'}
                    onChange={(e) => onUpdateUser(user.id, { jobLevel: e.target.value })}
                    className="min-w-[148px]"
                    options={JOB_LEVELS.map((lvl) => ({
                      value: lvl.id,
                      label: lang === 'th' ? lvl.labelTh : lvl.label,
                      tone: lvl.tone,
                    }))}
                  />
                  <TieredSelect
                    ariaLabel={`Assign role for ${user.employeeCode}`}
                    value={user.role}
                    onChange={(e) => onUpdateUser(user.id, { role: e.target.value })}
                    className="min-w-[152px]"
                    options={[ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE].map((role) => ({
                      value: role,
                      prefix: ROLE_TIER_PREFIX[role],
                      label: t.roleLabels?.[role] || role,
                      tone: ROLE_TONE[role],
                    }))}
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateUser(user.id, { accountStatus: 'ACTIVE' })}
                    className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-xs sm:text-sm font-semibold text-white cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" aria-hidden="true" />
                    {t.approveBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Role Permission Matrix */}
      <section className="min-w-0 rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 space-y-4">
        <div>
          <h2 id="super-perm-heading" className="text-lg font-bold text-(--ink-primary)">{t.permMatrixTitle}</h2>
          <p className="text-sm text-(--ink-secondary)">{t.permMatrixSubtitle}</p>
        </div>

        <TableRegion labelledBy="super-perm-heading">
          <table className="w-full text-left border-collapse">
            <caption className="visually-hidden">{t.permMatrixTitle}</caption>
            <thead>
              <tr className="border-b border-(--border-subtle) bg-(--surface-subtle) text-xs font-bold uppercase text-(--ink-secondary)">
                <th scope="col" className="py-3 px-3">{t.colPermission || 'Permission'}</th>
                {ROLE_COLUMNS.map((role) => (
                  <th scope="col" key={role} className="py-3 px-3 text-center">
                    {t.roleLabels?.[role] || role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle) text-sm">
              {PERMISSION_CATALOG.map((perm) => (
                <tr key={perm.key} className="hover:bg-(--surface-hover) transition-colors duration-150">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-(--ink-primary)">
                      {lang === 'th' ? perm.labelTh : perm.label}
                    </p>
                    <code className="text-xs text-(--ink-muted)">{perm.key}</code>
                  </td>
                  {ROLE_COLUMNS.map((role) => {
                    const allowed = Boolean(rolePermissions[role]?.[perm.key]);
                    const isLockedRule = role === ROLES.SUPER_ADMIN && perm.key === 'rbac:manage';
                    return (
                      <td key={role} className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={isLockedRule}
                          aria-label={`${role} ${perm.key}`}
                          onClick={() => onTogglePermission(role, perm.key)}
                          className={`inline-flex items-center justify-center min-w-11 min-h-10 px-3 rounded-md border text-xs font-bold transition-colors duration-150 ${
                            isLockedRule ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          style={
                            allowed
                              ? {
                                  backgroundColor: 'var(--status-high-bg)',
                                  color: 'var(--status-high-text)',
                                  borderColor: 'var(--status-high-border)',
                                }
                              : {
                                  backgroundColor: 'var(--surface-subtle)',
                                  color: 'var(--ink-muted)',
                                  borderColor: 'var(--border-subtle)',
                                }
                          }
                        >
                          {isLockedRule ? (
                            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : allowed ? (
                            <Check className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            t.permOffLabel || 'Off'
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TableRegion>
      </section>

      {/* Organization User Directory with Role + Job Level */}
      <section className="min-w-0 rounded-lg border border-(--border-subtle) bg-(--surface-card) p-5 space-y-4">
        <h2 id="super-users-heading" className="text-lg font-bold text-(--ink-primary)">{t.usersTableTitle}</h2>
        <TableRegion labelledBy="super-users-heading">
          <table className="w-full text-left border-collapse">
            <caption className="visually-hidden">{t.usersTableTitle}</caption>
            <thead>
              <tr className="border-b border-(--border-subtle) bg-(--surface-subtle) text-xs font-bold uppercase text-(--ink-secondary)">
                <th scope="col" className="py-2.5 px-3">{t.colEmpCode}</th>
                <th scope="col" className="py-2.5 px-3">{t.colEmployee}</th>
                <th scope="col" className="py-2.5 px-3">{t.colDepartment}</th>
                <th scope="col" className="py-2.5 px-3">{t.colJobLevel}</th>
                <th scope="col" className="py-2.5 px-3">{t.colRole}</th>
                <th scope="col" className="py-2.5 px-3">{t.colAccountStatus}</th>
                <th scope="col" className="py-2.5 px-3 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-subtle) text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-(--surface-hover) transition-colors duration-150">
                  <td className="py-3 px-3 font-mono font-bold text-xs text-(--ink-primary) tabular-nums">
                    {user.employeeCode}
                  </td>
                  <td className="py-3 px-3 font-semibold text-(--ink-primary)">
                    {lang === 'th' ? user.nameTh : user.name}
                    <div className="text-xs font-normal text-(--ink-muted)">{user.title}</div>
                  </td>
                  <td className="py-3 px-3 text-(--ink-secondary)">{user.department}</td>
                  <td className="py-3 px-3">
                    <TieredSelect
                      ariaLabel={`Job level for ${user.employeeCode}`}
                      value={user.jobLevel || 'L2_MID'}
                      onChange={(e) => onUpdateUser(user.id, { jobLevel: e.target.value })}
                      className="min-w-[152px]"
                      options={JOB_LEVELS.map((lvl) => ({
                        value: lvl.id,
                        label: lang === 'th' ? lvl.labelTh : lvl.label,
                        tone: lvl.tone,
                      }))}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <TieredSelect
                      ariaLabel={`Role for ${user.employeeCode}`}
                      value={user.role}
                      disabled={user.employeeCode === 'EMP-0001'}
                      onChange={(e) => onUpdateUser(user.id, { role: e.target.value })}
                      className="min-w-[164px]"
                      options={ROLE_COLUMNS.map((role) => ({
                        value: role,
                        prefix: ROLE_TIER_PREFIX[role],
                        label: t.roleLabels?.[role] || role,
                        tone: ROLE_TONE[role],
                      }))}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge
                        tone={
                          user.accountStatus === 'ACTIVE'
                            ? 'high'
                            : user.accountStatus === 'INVITED'
                              ? 'track'
                              : user.accountStatus === 'PENDING_APPROVAL'
                                ? 'warn'
                                : 'low'
                        }
                      >
                        {t.accountStatusLabels?.[user.accountStatus] || user.accountStatus}
                      </StatusBadge>
                      {user.accountStatus === 'INVITED' && user.inviteCode && (
                        <button
                          type="button"
                          onClick={() => handleCopyInvite(user)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-(--border-strong) bg-(--surface-subtle) hover:bg-(--surface-hover) font-mono text-[11px] font-bold text-(--ink-primary) cursor-pointer tabular-nums"
                        >
                          <Copy className="w-3 h-3 text-(--ink-muted)" aria-hidden="true" />
                          <span>
                            {copiedId === user.id
                              ? t.copiedInviteLabel
                              : `${t.inviteCodeChipLabel}: ${user.inviteCode}`}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {user.employeeCode !== 'EMP-0001' && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateUser(user.id, {
                            accountStatus: user.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                          })
                        }
                        className="min-h-10 px-3.5 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-xs font-semibold text-(--ink-primary) cursor-pointer"
                      >
                        {user.accountStatus === 'ACTIVE' ? t.suspendBtn : t.activateBtn}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableRegion>
      </section>

      {/* System Activity Log — Always Anchored at Bottom */}
      <ActivityLogPanel logs={superLogs} role="SUPER_ADMIN" t={t} />

      {/* Invite New Employee Modal (Generates 6-Digit Activation Code) */}
      <ModalDialog
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        labelledBy={`${uid}-invite-title`}
        panelClassName="max-w-lg rounded-lg border border-(--border-subtle) shadow-lg"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={`${uid}-invite-title`} className="text-lg font-bold text-(--ink-primary)">
                {t.inviteModalTitle}
              </h2>
              <p className="text-xs text-(--ink-secondary) mt-0.5">{t.inviteModalSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              aria-label={t.cancelBtn}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-(--ink-primary) cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {createdInvite ? (
            <div className="space-y-4">
              <div
                className="rounded-md border p-4 space-y-2.5"
                style={{
                  backgroundColor: 'var(--status-high-bg)',
                  borderColor: 'var(--status-high-border)',
                }}
              >
                <p className="text-sm font-bold" style={{ color: 'var(--status-high-text)' }}>
                  {t.inviteCreatedTitle}
                </p>
                <p className="text-xs text-(--ink-secondary)">{t.inviteCreatedDesc}</p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded border border-(--border-subtle) bg-(--surface-card) p-3">
                    <p className="text-[11px] font-bold uppercase text-(--ink-muted)">{t.empCodeLabel}</p>
                    <p className="text-lg font-mono font-extrabold text-(--ink-primary) tabular-nums">
                      {createdInvite.employeeCode}
                    </p>
                  </div>
                  <div className="rounded border border-(--border-subtle) bg-(--surface-card) p-3">
                    <p className="text-[11px] font-bold uppercase text-(--ink-muted)">{t.inviteCodeLabel}</p>
                    <p className="text-lg font-mono font-extrabold text-(--brand-primary) tracking-widest tabular-nums">
                      {createdInvite.inviteCode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCopyInvite(createdInvite)}
                  className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) cursor-pointer"
                >
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>{copiedId === createdInvite.id ? t.copiedInviteLabel : t.copyInviteBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="min-h-10 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white cursor-pointer"
                >
                  {t.drawerCancel}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitInvite} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${uid}-inv-code`} className="block text-xs font-semibold text-(--ink-primary)">
                    {t.empCodeLabel}
                  </label>
                  <input
                    id={`${uid}-inv-code`}
                    type="text"
                    required
                    value={inviteForm.employeeCode}
                    onChange={(e) => setInviteForm((p) => ({ ...p, employeeCode: e.target.value }))}
                    className="w-full min-h-10 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-sm text-(--ink-primary) uppercase tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${uid}-inv-name`} className="block text-xs font-semibold text-(--ink-primary)">
                    {t.fullNameLabel}
                  </label>
                  <input
                    id={`${uid}-inv-name`}
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full min-h-10 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-sm text-(--ink-primary)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${uid}-inv-dept`} className="block text-xs font-semibold text-(--ink-primary)">
                    {t.departmentLabel}
                  </label>
                  <TieredSelect
                    id={`${uid}-inv-dept`}
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm((p) => ({ ...p, department: e.target.value }))}
                    className="w-full min-h-10"
                    options={DEPARTMENT_OPTIONS}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${uid}-inv-title`} className="block text-xs font-semibold text-(--ink-primary)">
                    {t.jobTitleLabel}
                  </label>
                  <input
                    id={`${uid}-inv-title`}
                    type="text"
                    required
                    value={inviteForm.title}
                    onChange={(e) => setInviteForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full min-h-10 rounded-md border border-(--border-strong) bg-(--surface-card) px-3 text-sm text-(--ink-primary)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={`${uid}-inv-role`} className="block text-xs font-semibold text-(--ink-primary)">
                    {t.colRole}
                  </label>
                  <TieredSelect
                    id={`${uid}-inv-role`}
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full min-h-10"
                    options={[ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR_ADMIN].map((role) => ({
                      value: role,
                      prefix: ROLE_TIER_PREFIX[role],
                      label: t.roleLabels?.[role] || role,
                      tone: ROLE_TONE[role],
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${uid}-inv-lvl`} className="block text-xs font-semibold text-(--ink-primary)">
                    {t.colJobLevel}
                  </label>
                  <TieredSelect
                    id={`${uid}-inv-lvl`}
                    value={inviteForm.jobLevel}
                    onChange={(e) => setInviteForm((p) => ({ ...p, jobLevel: e.target.value }))}
                    className="w-full min-h-10"
                    options={JOB_LEVELS.map((lvl) => ({
                      value: lvl.id,
                      label: lang === 'th' ? lvl.labelTh : lvl.label,
                      tone: lvl.tone,
                    }))}
                  />
                </div>
              </div>

              {inviteForm.role === ROLES.EMPLOYEE && activeManagers.length > 0 && (
                <div className="space-y-1">
                  <label htmlFor={`${uid}-inv-mgr`} className="block text-xs font-semibold text-(--ink-primary)">
                    {t.reportingManagerLabel}
                  </label>
                  <TieredSelect
                    id={`${uid}-inv-mgr`}
                    value={inviteForm.managerId}
                    onChange={(e) => setInviteForm((p) => ({ ...p, managerId: e.target.value }))}
                    className="w-full min-h-10"
                    options={activeManagers.map((m) => ({
                      value: m.id,
                      label: `${lang === 'th' ? m.nameTh : m.name} (${m.department})`,
                      tone: 'track',
                    }))}
                  />
                </div>
              )}

              {inviteError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border p-3 text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--status-low-bg)',
                    color: 'var(--status-low-text)',
                    borderColor: 'var(--status-low-border)',
                  }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{inviteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="min-h-10 px-4 rounded-md border border-(--border-strong) bg-(--surface-card) hover:bg-(--surface-hover) text-sm font-semibold text-(--ink-primary) cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-md bg-(--brand-primary) hover:bg-(--brand-primary-hover) text-sm font-semibold text-white cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>{t.inviteCreateBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </ModalDialog>
    </div>
  );
}
