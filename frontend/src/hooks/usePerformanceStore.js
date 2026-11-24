import { useState, useCallback, useMemo } from 'react';
import {
  computeAnalytics,
  computeScoresClient,
  createInitialClientState,
} from '../constants/initialData.js';
import { DEMO_PERSONAS, ROLES } from '../constants/roles.js';

function makeComment(review, { phase, actorName, actorRole, action, comment }) {
  return {
    id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    round: review.revisionRound || 1,
    phase,
    actorName,
    actorRole,
    action,
    comment,
    createdAt: new Date().toISOString(),
  };
}

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

  const [currentUser, setCurrentUser] = useState(null);
  const [authScreen, setAuthScreen] = useState('login');

  const [activeRole, setActiveRole] = useState(ROLES.HR_ADMIN);
  const [activeManagerId, setActiveManagerId] = useState('usr-mgr-eng');
  const [activeEmployeeId, setActiveEmployeeId] = useState('usr-emp-fah');
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
              status: 'GOAL_DRAFT',
              revisionRound: 1,
              commentHistory: [],
              isOverdue: false,
              daysOverdue: 0,
              escalatedToSkipLevel: false,
              lastNudgedAt: null,
              extendedDeadline: null,
              goals: [],
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
        const nextVal = !prev[role]?.[permissionKey];
        appendLog('UPDATE_ROLE_PERMISSION', `Set ${role} -> ${permissionKey} = ${nextVal ? 'ALLOW' : 'DENY'}`);
        return {
          ...prev,
          [role]: { ...prev[role], [permissionKey]: nextVal },
        };
      });
      showToast(t.toastPermUpdated, 'success');
    },
    [appendLog, showToast, t.toastPermUpdated]
  );

  // Phase A: Employee builds / edits OKR/KPI goals and submits (Weight = 100%) to Manager
  const handleSubmitEmployeeGoals = useCallback(
    (reviewId, goals, note = '') => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r;
          const nextRound = r.status === 'GOAL_REVISION_REQUIRED' ? (r.revisionRound || 1) + 1 : r.revisionRound || 1;
          const updatedRev = { ...r, revisionRound: nextRound };
          const entry = makeComment(updatedRev, {
            phase: 'GOAL',
            actorName: r.employee.name,
            actorRole: 'EMPLOYEE',
            action: 'GOAL_SUBMITTED',
            comment: note.trim() || `Submitted ${goals.length} OKR/KPI goal(s) totaling 100% weight for manager approval.`,
          });
          return {
            ...updatedRev,
            goals,
            status: 'GOAL_PENDING_APPROVAL',
            commentHistory: [...(r.commentHistory || []), entry],
          };
        })
      );
      showToast(t.toastGoalsSubmitted, 'success');
    },
    [showToast, t.toastGoalsSubmitted]
  );

  // Phase A Ping-Pong: Manager Approves Goals or Returns for Revision
  const handleDecideEmployeeGoals = useCallback(
    (reviewId, decision, comment) => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r;
          const isApprove = decision === 'APPROVE';
          const entry = makeComment(r, {
            phase: 'GOAL',
            actorName: currentUser?.name || r.manager?.name || 'Manager',
            actorRole: activeRole,
            action: isApprove ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUESTED',
            comment: comment?.trim() || (isApprove ? 'Approved all OKR/KPI goals for execution.' : 'Please revise goals.'),
          });
          return {
            ...r,
            status: isApprove ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUIRED',
            commentHistory: [...(r.commentHistory || []), entry],
          };
        })
      );
      showToast(decision === 'APPROVE' ? t.toastGoalsApproved : t.toastGoalsReturned, decision === 'APPROVE' ? 'success' : 'warning');
    },
    [currentUser, activeRole, showToast, t.toastGoalsApproved, t.toastGoalsReturned]
  );

  // Phase B: Employee submits Actual + Description + Self Score (1-5) per goal
  const handleSubmitSelfReview = useCallback(
    (reviewId, selfPayload, updatedGoals) => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r;
          const entry = makeComment(r, {
            phase: 'REVIEW',
            actorName: r.employee.name,
            actorRole: 'EMPLOYEE',
            action: 'SELF_REVIEW_SUBMITTED',
            comment: selfPayload.reflection || 'Submitted actual results, achievement notes, and self scores.',
          });
          return {
            ...r,
            goals: updatedGoals || r.goals,
            selfPayload,
            status: 'SELF_REVIEW_SUBMITTED',
            isOverdue: false,
            daysOverdue: 0,
            commentHistory: [...(r.commentHistory || []), entry],
          };
        })
      );
      showToast(t.toastSelfSubmitted, 'success');
    },
    [showToast, t.toastSelfSubmitted]
  );

  // Phase C Ping-Pong: Manager returns Self-Review to Employee for more evidence
  const handleReturnReviewToEmployee = useCallback(
    (reviewId, comment) => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r;
          const nextRound = (r.revisionRound || 1) + 1;
          const updated = { ...r, revisionRound: nextRound };
          const entry = makeComment(updated, {
            phase: 'REVIEW',
            actorName: currentUser?.name || r.manager?.name || 'Manager',
            actorRole: activeRole,
            action: 'REVIEW_REVISION_REQUESTED',
            comment,
          });
          return {
            ...updated,
            status: 'REVIEW_REVISION_REQUIRED',
            commentHistory: [...(r.commentHistory || []), entry],
          };
        })
      );
      showToast(t.toastReviewReturned, 'warning');
    },
    [currentUser, activeRole, showToast, t.toastReviewReturned]
  );

  // Phase C: Manager evaluates and forwards to HR Calibration
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
          const nextHistory = submit
            ? [
                ...(r.commentHistory || []),
                makeComment(r, {
                  phase: 'REVIEW',
                  actorName: currentUser?.name || r.manager?.name || 'Manager',
                  actorRole: activeRole,
                  action: 'MANAGER_APPROVED',
                  comment: managerPayload.managerSummary || 'Evaluation approved and forwarded to HR Calibration.',
                }),
              ]
            : r.commentHistory || [];
          return {
            ...r,
            managerPayload,
            ...scores,
            status: submit ? 'MANAGER_APPROVED' : r.status,
            isOverdue: submit ? false : r.isOverdue,
            daysOverdue: submit ? 0 : r.daysOverdue,
            commentHistory: nextHistory,
          };
        })
      );
      showToast(t.toastEvalSaved, 'success');
    },
    [cycle, currentUser, activeRole, showToast, t.toastEvalSaved]
  );

  // Phase D: HR Returns review to Manager during Calibration (e.g., Bias Alert)
  const handleHrReturnToManager = useCallback(
    (reviewId, comment) => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r;
          const nextRound = (r.revisionRound || 1) + 1;
          const updated = { ...r, revisionRound: nextRound };
          const entry = makeComment(updated, {
            phase: 'CALIBRATION',
            actorName: currentUser?.name || 'HR Admin',
            actorRole: 'HR_ADMIN',
            action: 'HR_RETURNED_TO_MANAGER',
            comment,
          });
          return {
            ...updated,
            status: 'SELF_REVIEW_SUBMITTED',
            commentHistory: [...(r.commentHistory || []), entry],
          };
        })
      );
      appendLog('HR_RETURN_TO_MANAGER', `${comment} (${reviewId})`);
      showToast(t.toastHrReturned, 'warning');
    },
    [currentUser, appendLog, showToast, t.toastHrReturned]
  );

  // Phase D: HR Locks Calibration (MANAGER_APPROVED -> CALIBRATION_LOCKED)
  const handleLockCalibration = useCallback(() => {
    let count = 0;
    setReviews((prev) =>
      prev.map((r) => {
        if (r.status !== 'MANAGER_APPROVED') return r;
        count += 1;
        const entry = makeComment(r, {
          phase: 'CALIBRATION',
          actorName: currentUser?.name || 'HR Admin',
          actorRole: 'HR_ADMIN',
          action: 'CALIBRATION_LOCKED',
          comment: 'Cross-team calibration completed and locked prior to publication.',
        });
        return {
          ...r,
          status: 'CALIBRATION_LOCKED',
          commentHistory: [...(r.commentHistory || []), entry],
        };
      })
    );
    appendLog('CALIBRATION_LOCKED', `Locked calibration for ${count || 'approved'} review(s).`);
    showToast(t.toastCalibrated, 'success');
  }, [currentUser, appendLog, showToast, t.toastCalibrated]);

  // Phase D: HR Publishes Calibrated Results (CALIBRATION_LOCKED -> PUBLISHED)
  const handlePublishReady = useCallback(() => {
    const nowIso = new Date().toISOString();
    let count = 0;
    setReviews((prev) =>
      prev.map((r) => {
        if (r.status !== 'CALIBRATION_LOCKED') return r;
        count += 1;
        const entry = makeComment(r, {
          phase: 'RELEASE',
          actorName: currentUser?.name || 'HR Admin',
          actorRole: 'HR_ADMIN',
          action: 'PUBLISHED',
          comment: 'Final calibrated annual review result published to employee.',
        });
        return {
          ...r,
          status: 'PUBLISHED',
          publishedAt: nowIso,
          commentHistory: [...(r.commentHistory || []), entry],
        };
      })
    );
    appendLog('PUBLISH', `Published ${count || 'calibrated'} review(s) to employees.`);
    showToast(t.toastPublished, 'success');
  }, [currentUser, appendLog, showToast, t.toastPublished]);

  const handleToggleGracePeriod = useCallback(() => {
    setCycle((prev) => {
      const next = !prev.isGracePeriodActive;
      appendLog(next ? 'ENABLE_GRACE_PERIOD' : 'DISABLE_GRACE_PERIOD', next ? 'Enabled grace period.' : 'Disabled grace period.');
      return { ...prev, isGracePeriodActive: next };
    });
    showToast(t.toastCycleUpdated, 'success');
  }, [appendLog, showToast, t.toastCycleUpdated]);

  const handleToggleLockCycle = useCallback(() => {
    setCycle((prev) => {
      const next = !prev.isLocked;
      appendLog(next ? 'LOCK_CYCLE' : 'UNLOCK_CYCLE', next ? 'Locked review cycle.' : 'Reopened review cycle.');
      return { ...prev, isLocked: next };
    });
    showToast(t.toastCycleUpdated, 'warning');
  }, [appendLog, showToast, t.toastCycleUpdated]);

  const handleNudge = useCallback(
    (reviewId) => {
      const nowIso = new Date().toISOString();
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, lastNudgedAt: nowIso } : r)));
      appendLog('NUDGE', `Sent overdue reminder nudge for ${reviewId}.`);
      showToast(t.toastNudged, 'success');
    },
    [appendLog, showToast, t.toastNudged]
  );

  const handleExtendDeadline = useCallback(
    (reviewId, reason) => {
      const extended = new Date(Date.now() + 5 * 86400000).toISOString();
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, extendedDeadline: extended, isOverdue: false, daysOverdue: 0 } : r))
      );
      appendLog('EXTEND_DEADLINE', `${reason} (+5 days for ${reviewId})`);
      showToast(t.toastExtended, 'success');
    },
    [appendLog, showToast, t.toastExtended]
  );

  const handleEscalate = useCallback(
    (reviewId, reason) => {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, escalatedToSkipLevel: true } : r)));
      appendLog('ESCALATE', `${reason} (${reviewId})`);
      showToast(t.toastEscalated, 'warning');
    },
    [appendLog, showToast, t.toastEscalated]
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
    handleSubmitEmployeeGoals,
    handleDecideEmployeeGoals,
    handleSubmitSelfReview,
    handleReturnReviewToEmployee,
    handleSaveManagerEvaluation,
    handleHrReturnToManager,
    handleLockCalibration,
    handlePublishReady,
    handleToggleGracePeriod,
    handleToggleLockCycle,
    handleNudge,
    handleExtendDeadline,
    handleEscalate,
  };
}
