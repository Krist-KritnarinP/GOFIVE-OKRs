import { Check, Lock, UserCheck } from 'lucide-react';
import { PERMISSION_CATALOG, ROLES } from '../constants/roles.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';

const ROLE_COLUMNS = [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE];

export function SuperAdminPage({
  users,
  rolePermissions,
  auditLogCount = 0,
  t,
  lang,
  onUpdateUser,
  onTogglePermission,
}) {
  const pendingUsers = users.filter((u) => u.accountStatus === 'PENDING_APPROVAL');
  const activeCount = users.filter((u) => u.accountStatus === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.accountStatus === 'SUSPENDED').length;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
          {t.superTitle}
        </h1>
        <p className="text-sm sm:text-base text-[var(--ink-secondary)] mt-0.5">{t.superSubtitle}</p>
      </div>

      {/* 4 Governance KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiActiveAccounts}</p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)] tabular-nums">{activeCount}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiPendingApprovals}</p>
          <p
            className="mt-1.5 text-2xl font-bold tabular-nums"
            style={{ color: pendingUsers.length > 0 ? 'var(--status-warn-text)' : 'var(--status-high-text)' }}
          >
            {pendingUsers.length}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiSuspendedAccounts}</p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)] tabular-nums">{suspendedCount}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-sm font-medium text-[var(--ink-secondary)]">{t.kpiAuditEvents}</p>
          <p className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)] tabular-nums">{auditLogCount}</p>
        </div>
      </div>

      {/* Pending Registration Approvals */}
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.pendingApprovalsTitle}</h2>
          <StatusBadge tone={pendingUsers.length > 0 ? 'warn' : 'high'}>
            {pendingUsers.length}
          </StatusBadge>
        </div>

        {pendingUsers.length === 0 ? (
          <p className="text-sm text-[var(--ink-secondary)]">{t.noPendingApprovals}</p>
        ) : (
          <div className="space-y-2.5">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] p-4"
              >
                <div>
                  <p className="text-sm font-bold text-[var(--ink-primary)] tabular-nums">
                    {user.employeeCode} · {lang === 'th' ? user.nameTh : user.name}
                  </p>
                  <p className="text-xs text-[var(--ink-secondary)]">
                    {user.title} · {user.department}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    aria-label="Assign role"
                    value={user.role}
                    onChange={(e) => onUpdateUser(user.id, { role: e.target.value })}
                    className="min-h-10 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2.5 text-xs sm:text-sm font-semibold text-[var(--ink-primary)]"
                  >
                    {ROLE_COLUMNS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onUpdateUser(user.id, { accountStatus: 'ACTIVE' })}
                    className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-xs sm:text-sm font-semibold text-white cursor-pointer"
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
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.permMatrixTitle}</h2>
          <p className="text-sm text-[var(--ink-secondary)]">{t.permMatrixSubtitle}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs font-bold uppercase text-[var(--ink-secondary)]">
                <th className="py-3 px-3">Permission</th>
                {ROLE_COLUMNS.map((role) => (
                  <th key={role} className="py-3 px-3 text-center">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
              {PERMISSION_CATALOG.map((perm) => (
                <tr key={perm.key} className="hover:bg-[var(--surface-hover)] transition-colors duration-150">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-[var(--ink-primary)]">
                      {lang === 'th' ? perm.labelTh : perm.label}
                    </p>
                    <code className="text-xs text-[var(--ink-muted)]">{perm.key}</code>
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
                          className={`inline-flex items-center justify-center min-w-11 min-h-9 px-3 rounded-md border text-xs font-bold transition-colors duration-150 ${
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
                            'OFF'
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Organization User Directory */}
      <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--ink-primary)]">{t.usersTableTitle}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs font-bold uppercase text-[var(--ink-secondary)]">
                <th className="py-2.5 px-3">{t.colEmpCode}</th>
                <th className="py-2.5 px-3">{t.colEmployee}</th>
                <th className="py-2.5 px-3">{t.colDepartment}</th>
                <th className="py-2.5 px-3">{t.colRole}</th>
                <th className="py-2.5 px-3">{t.colAccountStatus}</th>
                <th className="py-2.5 px-3 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150">
                  <td className="py-3 px-3 font-mono font-bold text-xs text-[var(--ink-primary)] tabular-nums">
                    {user.employeeCode}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--ink-primary)]">
                    {lang === 'th' ? user.nameTh : user.name}
                    <div className="text-xs font-normal text-[var(--ink-muted)]">{user.title}</div>
                  </td>
                  <td className="py-3 px-3 text-[var(--ink-secondary)]">{user.department}</td>
                  <td className="py-3 px-3">
                    <select
                      value={user.role}
                      disabled={user.employeeCode === 'EMP-0001'}
                      onChange={(e) => onUpdateUser(user.id, { role: e.target.value })}
                      className="min-h-9 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] px-2 text-xs font-semibold text-[var(--ink-primary)] disabled:bg-[var(--surface-hover)] disabled:text-[var(--ink-muted)]"
                    >
                      {ROLE_COLUMNS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge
                      tone={
                        user.accountStatus === 'ACTIVE'
                          ? 'high'
                          : user.accountStatus === 'PENDING_APPROVAL'
                            ? 'warn'
                            : 'low'
                      }
                    >
                      {user.accountStatus}
                    </StatusBadge>
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
                        className="min-h-9 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--ink-primary)] cursor-pointer"
                      >
                        {user.accountStatus === 'ACTIVE' ? t.suspendBtn : t.activateBtn}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
