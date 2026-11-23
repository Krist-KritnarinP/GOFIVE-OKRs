import { useState, useCallback, useMemo } from 'react';
import {
  computeAnalytics,
  computeScoresClient,
  createInitialClientState,
} from '../constants/initialData.js';
import { DEMO_PERSONAS, ROLES } from '../constants/roles.js';

export function usePerformanceStore(t) {
  const initial = useMemo(() => createInitialClientState(), []);
  const [cycle, setCycle] = useState(initial.cycle);
  const [reviews, setReviews] = useState(initial.reviews);
  const [auditLogs, setAuditLogs] = useState(initial.auditLogs);
  const [users, setUsers] = useState(initial.users);
  const [rolePermissions, setRolePermissions] = useState(initial.rolePermissions);
  const [passwords, setPasswords] = useState(() =>
    Object.fromEntries(initial.users.map((u) => [u.employeeCode, 'DemoPass123!']))
  );

  // Auth state — starts on Login page so evaluators see the full Employee Code + Password flow
  const [currentUser, setCurrentUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('login');

  const [activeRole, setActiveRole] = useState(ROLES.HR_ADMIN);
  const [activeManagerId, setActiveManagerId] = useState('usr-mgr-eng');
  const [activeEmployeeId, setActiveEmployeeId] = useState('usr-emp-nida');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const analytics = useMemo(() => computeAnalytics(reviews), [reviews]);

  const appendLog = useCallback(
    (action, reason, actorName) => {
      const actor = actorName || currentUser?.name || 'System';
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          action,
          actorName: actor,
          reason,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [currentUser]
  );

  const can = useCallback(
    (permissionKey) => Boolean(rolePermissions[activeRole]?.[permissionKey]),
    [rolePermissions, activeRole]
  );

  const handleLogin = useCallback(
    (employeeCode, password) => {
      const code = String(employeeCode || '').trim().toUpperCase();
      const user = users.find((u) => u.employeeCode.toUpperCase() === code);
      const expectedPassword = passwords[code];

      if (!user || !expectedPassword || password !== expectedPassword) {
        return { ok: false, error: t.authErrInvalid };
      }
      if (user.accountStatus === 'PENDING_APPROVAL') {
        return { ok: false, error: t.authErrPending };
      }
      if (user.accountStatus === 'SUSPENDED') {
        return { ok: false, error: t.authErrSuspended };
      }

      setCurrentUser(user);
      setActiveRole(user.role);
      if (user.role === ROLES.MANAGER) setActiveManagerId(user.id);
      if (user.role === ROLES.EMPLOYEE) setActiveEmployeeId(user.id);
      return { ok: true, user };
    },
    [users, passwords, t.authErrInvalid, t.authErrPending, t.authErrSuspended]
  );

  const handleRegister = useCallback(
    ({ employeeCode, name, department, title, password }) => {
      const code = String(employeeCode || '').trim().toUpperCase();
      if (users.some((u) => u.employeeCode.toUpperCase() === code)) {
        return { ok: false, error: t.authErrDuplicate };
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        employeeCode: code,
        name: name.trim(),
        nameTh: name.trim(),
        title: title.trim(),
        department: department.trim(),
        role: ROLES.EMPLOYEE,
        accountStatus: 'PENDING_APPROVAL',
      };
      setUsers((prev) => [newUser, ...prev]);
      setPasswords((prev) => ({ ...prev, [code]: password }));
      appendLog('USER_REGISTERED', `New registration ${code} (${newUser.name}) pending approval.`, newUser.name);
      return { ok: true, user: newUser };
    },
    [users, appendLog, t.authErrDuplicate]
  );

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setAuthScreen('login');
  }, []);

  const handleBypassDemo = useCallback(() => {
    setCurrentUser(null);
    setAuthScreen('demo-picker');
  }, []);

  const handleEnterAsUser = useCallback(
    (user) => {
      if (!user) return;
      setCurrentUser(user);
      setActiveRole(user.role);
      if (user.role === ROLES.MANAGER) setActiveManagerId(user.id);
      if (user.role === ROLES.EMPLOYEE) setActiveEmployeeId(user.id);
      showToast(`${user.employeeCode} · ${user.name}`, 'success');
    },
    [showToast]
  );

  const handleSelectRole = useCallback(
    (role) => {
      setActiveRole(role);
      const demo = DEMO_PERSONAS.find((p) => p.role === role);
      if (demo) {
        const matched = users.find((u) => u.id === demo.userId);
        if (matched) setCurrentUser(matched);
      }
    },
    [users]
  );

  const handleUpdateUser = useCallback(
    (userId, patch) => {
      let approvedEmployee = null;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const updated = { ...u, ...patch };
          if (
            u.accountStatus === 'PENDING_APPROVAL' &&
            updated.accountStatus === 'ACTIVE' &&
            updated.role === ROLES.EMPLOYEE
          ) {
            approvedEmployee = updated;
          }
          appendLog(
            'ADMIN_UPDATE_USER',
            `Updated ${updated.employeeCode}: role=${updated.role}, status=${updated.accountStatus}`
          );
          return updated;
        })
      );

      // Provision a starter DRAFT review when a new employee is approved as EMPLOYEE
      if (approvedEmployee) {
        setReviews((prev) => {
          if (prev.some((r) => r.employeeId === approvedEmployee.id)) return prev;
          return [
            ...prev,
            {
              id: `rev-${approvedEmployee.id}`,
              employeeId: approvedEmployee.id,
              managerId: 'usr-mgr-eng',
              employee: {
                id: approvedEmployee.id,
                name: approvedEmployee.name,
                nameTh: approvedEmployee.nameTh,
                title: approvedEmployee.title,
                department: approvedEmployee.department,
              },
              manager: {
                id: 'usr-mgr-eng',
                name: 'Sarah Chen',
                nameTh: 'ซาร่า เฉิน',
                department: 'Engineering',
              },
              status: 'DRAFT',
              isOverdue: false,
              daysOverdue: 0,
              escalatedToSkipLevel: false,
              lastNudgedAt: null,
              extendedDeadline: null,
              goals: [
                {
                  id: `g-${approvedEmployee.id}-1`,
                  title: 'Complete 90-day onboarding & role KPI alignment',
                  titleTh: 'ผ่านการปฐมนิเทศ 90 วันและกำหนดเป้าหมาย KPI ประจำตำแหน่ง',
                  metric: '100% milestones',
                  weight: 50,
                  progressPct: 60,
                },
                {
                  id: `g-${approvedEmployee.id}-2`,
                  title: 'Deliver first quarter departmental objective',
                  titleTh: 'ส่งมอบเป้าหมายหลักของแผนกในไตรมาสแรก',
                  metric: 'On-time delivery',
                  weight: 50,
                  progressPct: 55,
                },
              ],
              selfPayload: null,
              managerPayload: null,
              whatPct: null,
              whatScore: null,
              howScore: null,
              overallScore: null,
              nineBoxCell: null,
            },
          ];
        });
      }

      showToast(t.toastUserUpdated, 'success');
    },
    [appendLog, showToast, t.toastUserUpdated]
  );

  const handleTogglePermission = useCallback(
    (role, permissionKey) => {
      if (role === ROLES.SUPER_ADMIN && permissionKey === 'rbac:manage') return;
      setRolePermissions((prev) => {
        const current = Boolean(prev[role]?.[permissionKey]);
        const nextVal = !current;
        appendLog(
          'UPDATE_ROLE_PERMISSION',
          `Set ${role} -> ${permissionKey} = ${nextVal ? 'ALLOW' : 'DENY'}`
        );
        return {
          ...prev,
          [role]: {
            ...prev[role],
            [permissionKey]: nextVal,
          },
        };
      });
      showToast(t.toastPermUpdated, 'success');
    },
    [appendLog, showToast, t.toastPermUpdated]
  );

  const handleToggleGracePeriod = useCallback(() => {
    setCycle((prev) => {
      const next = !prev.isGracePeriodActive;
      appendLog(
        next ? 'ENABLE_GRACE_PERIOD' : 'DISABLE_GRACE_PERIOD',
        next ? 'Enabled cycle grace period for late submissions.' : 'Disabled cycle grace period.'
      );
      return { ...prev, isGracePeriodActive: next };
    });
    showToast(t.toastCycleUpdated, 'success');
  }, [appendLog, showToast, t.toastCycleUpdated]);

  const handleToggleLockCycle = useCallback(() => {
    setCycle((prev) => {
      const next = !prev.isLocked;
      appendLog(
        next ? 'LOCK_CYCLE' : 'UNLOCK_CYCLE',
        next ? 'Locked annual review cycle.' : 'Reopened annual review cycle.'
      );
      return { ...prev, isLocked: next };
    });
    showToast(t.toastCycleUpdated, 'warning');
  }, [appendLog, showToast, t.toastCycleUpdated]);

  const handleNudge = useCallback(
    (reviewId) => {
      const nowIso = new Date().toISOString();
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, lastNudgedAt: nowIso } : r))
      );
      appendLog('NUDGE', `Sent overdue reminder nudge for ${reviewId}.`);
      showToast(t.toastNudged, 'success');
    },
    [appendLog, showToast, t.toastNudged]
  );

  const handleExtendDeadline = useCallback(
    (reviewId, reason) => {
      const extended = new Date(Date.now() + 5 * 86400000).toISOString();
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, extendedDeadline: extended, isOverdue: false, daysOverdue: 0 }
            : r
        )
      );
      appendLog('EXTEND_DEADLINE', `${reason} (+5 days for ${reviewId})`);
      showToast(t.toastExtended, 'success');
    },
    [appendLog, showToast, t.toastExtended]
  );

  const handleEscalate = useCallback(
    (reviewId, reason) => {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, escalatedToSkipLevel: true } : r))
      );
      appendLog('ESCALATE', `${reason} (${reviewId})`);
      showToast(t.toastEscalated, 'warning');
    },
    [appendLog, showToast, t.toastEscalated]
  );

  const handlePublishReady = useCallback(() => {
    const nowIso = new Date().toISOString();
    let count = 0;
    setReviews((prev) =>
      prev.map((r) => {
        if (r.status === 'READY_FOR_RELEASE') {
          count += 1;
          return { ...r, status: 'PUBLISHED', publishedAt: nowIso };
        }
        return r;
      })
    );
    appendLog('PUBLISH', `Published ${count || 'ready'} review(s) to employees.`);
    showToast(t.toastPublished, 'success');
  }, [appendLog, showToast, t.toastPublished]);

  const handleSaveManagerEvaluation = useCallback(
    (reviewId, managerPayload, submit) => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r;
          const scores = computeScoresClient({
            goals: r.goals,
            goalRatings: managerPayload.goalRatings,
            competencyRatings: managerPayload.competencyRatings,
            cycle,
          });
          return {
            ...r,
            managerPayload,
            ...scores,
            status: submit ? 'READY_FOR_RELEASE' : r.status,
            isOverdue: submit ? false : r.isOverdue,
            daysOverdue: submit ? 0 : r.daysOverdue,
          };
        })
      );
      showToast(t.toastEvalSaved, 'success');
    },
    [cycle, showToast, t.toastEvalSaved]
  );

  const handleSubmitSelfReview = useCallback(
    (reviewId, selfPayload) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                selfPayload,
                status: 'SELF_REVIEW_SUBMITTED',
                isOverdue: false,
                daysOverdue: 0,
              }
            : r
        )
      );
      showToast(t.toastSelfSubmitted, 'success');
    },
    [showToast, t.toastSelfSubmitted]
  );

  return {
    cycle,
    reviews,
    auditLogs,
    users,
    rolePermissions,
    analytics,
    currentUser,
    authScreen,
    setAuthScreen,
    activeRole,
    setActiveRole: handleSelectRole,
    activeManagerId,
    setActiveManagerId,
    activeEmployeeId,
    setActiveEmployeeId,
    toast,
    dismissToast,
    can,
    handleLogin,
    handleRegister,
    handleLogout,
    handleBypassDemo,
    handleEnterAsUser,
    handleUpdateUser,
    handleTogglePermission,
    handleToggleGracePeriod,
    handleToggleLockCycle,
    handleNudge,
    handleExtendDeadline,
    handleEscalate,
    handlePublishReady,
    handleSaveManagerEvaluation,
    handleSubmitSelfReview,
  };
}
