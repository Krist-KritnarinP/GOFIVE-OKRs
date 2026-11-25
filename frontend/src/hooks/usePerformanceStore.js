import { useState, useCallback, useMemo } from 'react';
import {
  computeAnalytics,
  computeOverdueClient,
  computeScoresClient,
  createInitialClientState,
  defaultManagerForDepartmentClient,
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

  const enrichedReviews = useMemo(
    () => reviews.map((r) => ({ ...r, ...computeOverdueClient(r, cycle) })),
    [reviews, cycle]
  );

  const analytics = useMemo(() => computeAnalytics(enrichedReviews), [enrichedReviews]);

  const appendLog = useCallback(
    ({
      action,
      reason,
      visibilityScope = 'HR_INTERNAL',
      targetEmployeeId = null,
      targetManagerId = null,
      actorId = null,
      actorName = null,
      recipientName = null,
    }) => {
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          action,
          actorId: actorId || currentUser?.id || 'system',
          actorName: actorName || currentUser?.name || 'System',
          recipientName,
          visibilityScope,
          targetEmployeeId,
          targetManagerId,
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

      if (user?.accountStatus === 'INVITED') {
        return { ok: false, error: t.authErrInvited };
      }
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
    [users, passwords, t.authErrInvited, t.authErrInvalid, t.authErrPending, t.authErrSuspended]
  );

  const handleInviteUser = useCallback(
    ({ employeeCode, name, department, title, role, jobLevel, managerId }) => {
      const code = String(employeeCode || '').trim().toUpperCase();
      if (users.some((u) => u.employeeCode.toUpperCase() === code)) {
        return { ok: false, error: t.authErrDuplicate };
      }
      let inviteCode;
      if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const buf = new Uint32Array(1);
        window.crypto.getRandomValues(buf);
        inviteCode = String(100000 + (buf[0] % 900000));
      } else {
        inviteCode = String(Math.floor(100000 + Math.random() * 900000));
      }
      const inviteExpiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      const newUser = {
        id: `usr-inv-${Date.now()}`,
        employeeCode: code,
        name: name.trim(),
        nameTh: name.trim(),
        title: title.trim(),
        department: department.trim(),
        jobLevel: jobLevel || 'L1_JUNIOR',
        role: role || ROLES.EMPLOYEE,
        managerId: role === ROLES.EMPLOYEE ? managerId || null : null,
        accountStatus: 'INVITED',
        inviteCode,
        inviteExpiresAt,
      };
      setUsers((prev) => [newUser, ...prev]);
      appendLog({
        action: 'USER_INVITED',
        visibilityScope: 'ADMIN_SECURITY',
        targetEmployeeId: newUser.id,
        reason: `Invited ${code} (${newUser.name}) as ${newUser.role} (${newUser.jobLevel}) in ${newUser.department} with 6-digit activation code.`,
      });
      showToast(t.toastUserInvited, 'success');
      return { ok: true, user: newUser };
    },
    [users, appendLog, showToast, t.authErrDuplicate, t.toastUserInvited]
  );

  const handleActivateInvite = useCallback(
    ({ employeeCode, inviteCode, password }) => {
      const code = String(employeeCode || '').trim().toUpperCase();
      const pin = String(inviteCode || '').trim();
      const target = users.find(
        (u) =>
          u.employeeCode.toUpperCase() === code &&
          u.accountStatus === 'INVITED' &&
          u.inviteCode === pin
      );
      if (!target) {
        return { ok: false, error: t.authErrInviteInvalid };
      }

      const activated = { ...target, accountStatus: 'ACTIVE', inviteCode: null };
      setUsers((prev) => prev.map((u) => (u.id === target.id ? activated : u)));
      setPasswords((prev) => ({ ...prev, [code]: password }));

      if (activated.role === ROLES.EMPLOYEE) {
        const assignedManager =
          (activated.managerId && users.find((u) => u.id === activated.managerId)) ||
          defaultManagerForDepartmentClient(activated.department, users);
        setReviews((prev) => {
          if (prev.some((r) => r.employeeId === activated.id)) return prev;
          return [
            ...prev,
            {
              id: `rev-${activated.id}`,
              employeeId: activated.id,
              managerId: assignedManager.id,
              employee: {
                id: activated.id,
                name: activated.name,
                nameTh: activated.nameTh,
                title: activated.title,
                department: activated.department,
                jobLevel: activated.jobLevel || 'L1_JUNIOR',
              },
              manager: {
                id: assignedManager.id,
                name: assignedManager.name,
                nameTh: assignedManager.nameTh,
                department: assignedManager.department,
                jobLevel: assignedManager.jobLevel || 'L4_LEAD',
              },
              status: 'GOAL_DRAFT',
              revisionRound: 1,
              goalsSubmittedAt: null,
              goalsApprovedAt: null,
              selfSubmittedAt: null,
              managerSubmittedAt: null,
              publishedAt: null,
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

      appendLog({
        action: 'USER_ACTIVATED',
        visibilityScope: 'ADMIN_SECURITY',
        targetEmployeeId: activated.id,
        actorId: activated.id,
        actorName: activated.name,
        reason: `${code} (${activated.name}) activated invited account and set personal password.`,
      });
      showToast(t.toastAccountActivated, 'success');
      return { ok: true, user: activated };
    },
    [users, appendLog, showToast, t.authErrInviteInvalid, t.toastAccountActivated]
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
        jobLevel: 'L1_JUNIOR',
        role: ROLES.EMPLOYEE,
        accountStatus: 'PENDING_APPROVAL',
      };
      setUsers((prev) => [newUser, ...prev]);
      setPasswords((prev) => ({ ...prev, [code]: password }));
      appendLog({
        action: 'USER_REGISTERED',
        visibilityScope: 'ADMIN_SECURITY',
        targetEmployeeId: newUser.id,
        actorId: newUser.id,
        actorName: newUser.name,
        reason: `New registration ${code} (${newUser.name}) pending Super Admin approval.`,
      });
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
      const target = users.find((u) => u.id === userId);
      if (!target) return;
      const updated = { ...target, ...patch };
      const becameActiveEmployee =
        target.accountStatus === 'PENDING_APPROVAL' &&
        updated.accountStatus === 'ACTIVE' &&
        updated.role === ROLES.EMPLOYEE;

      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));

      if (patch.jobLevel) {
        setReviews((prev) =>
          prev.map((r) =>
            r.employeeId === userId
              ? { ...r, employee: { ...r.employee, jobLevel: patch.jobLevel } }
              : r
          )
        );
      }

      if (becameActiveEmployee) {
        const assignedManager = defaultManagerForDepartmentClient(updated.department, users);
        setReviews((prev) => {
          if (prev.some((r) => r.employeeId === updated.id)) return prev;
          return [
            ...prev,
            {
              id: `rev-${updated.id}`,
              employeeId: updated.id,
              managerId: assignedManager.id,
              employee: {
                id: updated.id,
                name: updated.name,
                nameTh: updated.nameTh,
                title: updated.title,
                department: updated.department,
                jobLevel: updated.jobLevel || 'L1_JUNIOR',
              },
              manager: assignedManager,
              status: 'GOAL_DRAFT',
              revisionRound: 1,
              goalsSubmittedAt: null,
              goalsApprovedAt: null,
              selfSubmittedAt: null,
              managerSubmittedAt: null,
              publishedAt: null,
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

      appendLog({
        action: 'ADMIN_UPDATE_USER',
        visibilityScope: 'ADMIN_SECURITY',
        targetEmployeeId: updated.id,
        reason: `Updated ${updated.employeeCode} (${updated.name}): role=${updated.role}, level=${updated.jobLevel}, status=${updated.accountStatus}`,
      });

      showToast(t.toastUserUpdated, 'success');
    },
    [users, appendLog, showToast, t.toastUserUpdated]
  );

  const handleTogglePermission = useCallback(
    (role, permissionKey) => {
      if (role === ROLES.SUPER_ADMIN && permissionKey === 'rbac:manage') return;
      const nextVal = !rolePermissions[role]?.[permissionKey];
      setRolePermissions((prev) => ({
        ...prev,
        [role]: { ...prev[role], [permissionKey]: nextVal },
      }));
      appendLog({
        action: 'UPDATE_ROLE_PERMISSION',
        visibilityScope: 'ADMIN_SECURITY',
        reason: `Set ${role} -> ${permissionKey} = ${nextVal ? 'ALLOW' : 'DENY'}`,
      });
      showToast(t.toastPermUpdated, 'success');
    },
    [rolePermissions, appendLog, showToast, t.toastPermUpdated]
  );

  const handleSubmitEmployeeGoals = useCallback(
    (reviewId, goals, note = '') => {
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return;
      const nowIso = new Date().toISOString();
      const nextRound =
        target.status === 'GOAL_REVISION_REQUIRED'
          ? (target.revisionRound || 1) + 1
          : target.revisionRound || 1;
      const commentText =
        note.trim() || `Submitted ${goals.length} OKR(s) totaling 100% weight for manager approval.`;
      const entry = makeComment(
        { ...target, revisionRound: nextRound },
        {
          phase: 'GOAL',
          actorName: target.employee.name,
          actorRole: 'EMPLOYEE',
          action: 'GOAL_SUBMITTED',
          comment: commentText,
        }
      );

      setReviews((prev) =>
        prev.map((r) =>
          r.id !== reviewId
            ? r
            : {
                ...r,
                revisionRound: nextRound,
                goals,
                status: 'GOAL_PENDING_APPROVAL',
                goalsSubmittedAt: nowIso,
                commentHistory: [...(r.commentHistory || []), entry],
              }
        )
      );

      appendLog({
        action: 'GOAL_SUBMITTED',
        visibilityScope: 'PUBLIC_SELF',
        targetEmployeeId: target.employeeId,
        targetManagerId: target.managerId,
        actorId: target.employeeId,
        actorName: target.employee.name,
        reason: `${target.employee.name} submitted ${goals.length} OKR(s) (Round ${nextRound}) for approval.`,
      });
      showToast(t.toastGoalsSubmitted, 'success');
    },
    [reviews, appendLog, showToast, t.toastGoalsSubmitted]
  );

  const handleDecideEmployeeGoals = useCallback(
    (reviewId, decision, comment, adjustedGoals = null) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return;
      const nowIso = new Date().toISOString();
      const isApprove = decision === 'APPROVE';
      let nextGoals = target.goals;
      const adjustments = [];

      if (isApprove && Array.isArray(adjustedGoals) && adjustedGoals.length > 0) {
        const adjMap = new Map(adjustedGoals.map((g) => [g.id, g]));
        nextGoals = target.goals.map((g) => {
          const adj = adjMap.get(g.id);
          if (!adj) return g;
          if (Number(adj.weight) !== Number(g.weight) || Number(adj.multiplier) !== Number(g.multiplier)) {
            adjustments.push(
              `"${g.title}": Weight ${g.weight}% -> ${adj.weight}%, Multiplier ${g.multiplier}x -> ${adj.multiplier}x`
            );
          }
          return { ...g, weight: Number(adj.weight), multiplier: Number(adj.multiplier) };
        });
      }

      const diffNote = adjustments.length > 0 ? ` [Manager adjusted: ${adjustments.join(' | ')}]` : '';
      const finalComment =
        (comment?.trim() || (isApprove ? 'Approved all OKRs for execution.' : 'Please revise OKRs.')) +
        diffNote;

      const entry = makeComment(target, {
        phase: 'GOAL',
        actorName: currentUser?.name || target.manager?.name || 'Manager',
        actorRole: activeRole,
        action: isApprove ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUESTED',
        comment: finalComment,
      });

      setReviews((prev) =>
        prev.map((r) =>
          r.id !== reviewId
            ? r
            : {
                ...r,
                goals: nextGoals,
                status: isApprove ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUIRED',
                goalsApprovedAt: isApprove ? nowIso : r.goalsApprovedAt,
                commentHistory: [...(r.commentHistory || []), entry],
              }
        )
      );

      appendLog({
        action: isApprove ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUESTED',
        visibilityScope: 'PUBLIC_SELF',
        targetEmployeeId: target.employeeId,
        targetManagerId: target.managerId,
        actorId: currentUser?.id || target.managerId,
        actorName: currentUser?.name || target.manager?.name || 'Manager',
        recipientName: target.employee.name,
        reason: `${target.employee.name}: ${finalComment}`,
      });
      showToast(
        isApprove ? t.toastGoalsApproved : t.toastGoalsReturned,
        isApprove ? 'success' : 'warning'
      );
    },
    [reviews, currentUser, activeRole, appendLog, showToast, t.toastGoalsApproved, t.toastGoalsReturned]
  );

  const handleSubmitSelfReview = useCallback(
    (reviewId, selfPayload, updatedGoals) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return;
      const nowIso = new Date().toISOString();
      const entry = makeComment(target, {
        phase: 'REVIEW',
        actorName: target.employee.name,
        actorRole: 'EMPLOYEE',
        action: 'SELF_REVIEW_SUBMITTED',
        comment: selfPayload.reflection || 'Submitted actual OKR outcomes, achievement notes, and self scores.',
      });

      setReviews((prev) =>
        prev.map((r) =>
          r.id !== reviewId
            ? r
            : {
                ...r,
                goals: updatedGoals || r.goals,
                selfPayload,
                status: 'SELF_REVIEW_SUBMITTED',
                selfSubmittedAt: nowIso,
                isOverdue: false,
                daysOverdue: 0,
                commentHistory: [...(r.commentHistory || []), entry],
              }
        )
      );

      appendLog({
        action: 'SELF_REVIEW_SUBMITTED',
        visibilityScope: 'PUBLIC_SELF',
        targetEmployeeId: target.employeeId,
        targetManagerId: target.managerId,
        actorId: target.employeeId,
        actorName: target.employee.name,
        reason: `${target.employee.name} submitted OKR achievements and self-review.`,
      });
      showToast(t.toastSelfSubmitted, 'success');
    },
    [reviews, appendLog, showToast, t.toastSelfSubmitted]
  );

  const handleReturnReviewToEmployee = useCallback(
    (reviewId, comment) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return;
      const nextRound = (target.revisionRound || 1) + 1;
      const entry = makeComment(
        { ...target, revisionRound: nextRound },
        {
          phase: 'REVIEW',
          actorName: currentUser?.name || target.manager?.name || 'Manager',
          actorRole: activeRole,
          action: 'REVIEW_REVISION_REQUESTED',
          comment,
        }
      );

      setReviews((prev) =>
        prev.map((r) =>
          r.id !== reviewId
            ? r
            : {
                ...r,
                revisionRound: nextRound,
                status: 'REVIEW_REVISION_REQUIRED',
                commentHistory: [...(r.commentHistory || []), entry],
              }
        )
      );

      appendLog({
        action: 'REVIEW_REVISION_REQUESTED',
        visibilityScope: 'PUBLIC_SELF',
        targetEmployeeId: target.employeeId,
        targetManagerId: target.managerId,
        actorId: currentUser?.id || target.managerId,
        actorName: currentUser?.name || target.manager?.name || 'Manager',
        reason: `Returned self-review for ${target.employee.name} (Round ${nextRound}): ${comment}`,
      });
      showToast(t.toastReviewReturned, 'warning');
    },
    [reviews, currentUser, activeRole, appendLog, showToast, t.toastReviewReturned]
  );

  const handleSaveManagerEvaluation = useCallback(
    (reviewId, managerPayload, submit) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return;
      const nowIso = new Date().toISOString();
      const scores = computeScoresClient({
        goals: target.goals,
        goalRatings: managerPayload.goalRatings,
        competencyRatings: managerPayload.competencyRatings,
        cycle,
      });
      const entry = submit
        ? makeComment(target, {
            phase: 'REVIEW',
            actorName: currentUser?.name || target.manager?.name || 'Manager',
            actorRole: activeRole,
            action: 'MANAGER_APPROVED',
            comment: managerPayload.managerSummary || 'Evaluation approved and sent to HR review queue.',
          })
        : null;

      setReviews((prev) =>
        prev.map((r) =>
          r.id !== reviewId
            ? r
            : {
                ...r,
                managerPayload,
                ...scores,
                status: submit ? 'MANAGER_APPROVED' : r.status,
                managerSubmittedAt: submit ? nowIso : r.managerSubmittedAt,
                isOverdue: submit ? false : r.isOverdue,
                daysOverdue: submit ? 0 : r.daysOverdue,
                commentHistory: entry ? [...(r.commentHistory || []), entry] : r.commentHistory || [],
              }
        )
      );

      if (submit) {
        appendLog({
          action: 'MANAGER_APPROVED',
          visibilityScope: 'TEAM_MANAGER',
          targetEmployeeId: target.employeeId,
          targetManagerId: target.managerId,
          actorId: currentUser?.id || target.managerId,
          actorName: currentUser?.name || target.manager?.name || 'Manager',
          reason: `Submitted manager evaluation for ${target.employee.name} (Score: ${scores.overallScore}) to HR Approve & Publish queue.`,
        });
      }
      showToast(t.toastEvalSaved, 'success');
    },
    [reviews, cycle, currentUser, activeRole, appendLog, showToast, t.toastEvalSaved]
  );

  const handlePostHrbpAdvisorComment = useCallback(
    (reviewId, comment) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return;
      const entry = makeComment(target, {
        phase: 'HRBP_ADVISOR',
        actorName: currentUser?.name || 'Pluem Srisuk (HRBP)',
        actorRole: 'HR_ADMIN',
        action: 'HRBP_ADVISOR_COMMENT',
        comment,
      });

      setReviews((prev) =>
        prev.map((r) =>
          r.id !== reviewId
            ? r
            : { ...r, commentHistory: [...(r.commentHistory || []), entry] }
        )
      );

      appendLog({
        action: 'HRBP_ADVISOR_COMMENT',
        visibilityScope: 'PUBLIC_SELF',
        targetEmployeeId: target.employeeId,
        targetManagerId: target.managerId,
        recipientName: target.manager?.name
          ? `${target.employee.name} & ${target.manager.name}`
          : target.employee.name,
        reason: `HRBP Advisor on ${target.employee.name}: ${comment}`,
      });
      showToast(t.toastAdvisorPosted, 'success');
    },
    [reviews, currentUser, appendLog, showToast, t.toastAdvisorPosted]
  );

  const handleHrReturnToManager = useCallback(
    (reviewId, comment) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (!target) return;
      const nextRound = (target.revisionRound || 1) + 1;
      const entry = makeComment(
        { ...target, revisionRound: nextRound },
        {
          phase: 'HR_REVIEW',
          actorName: currentUser?.name || 'HR Admin',
          actorRole: 'HR_ADMIN',
          action: 'HR_RETURNED_TO_MANAGER',
          comment,
        }
      );

      setReviews((prev) =>
        prev.map((r) =>
          r.id !== reviewId
            ? r
            : {
                ...r,
                revisionRound: nextRound,
                status: 'SELF_REVIEW_SUBMITTED',
                commentHistory: [...(r.commentHistory || []), entry],
              }
        )
      );

      appendLog({
        action: 'HR_RETURN_TO_MANAGER',
        visibilityScope: 'TEAM_MANAGER',
        targetEmployeeId: target.employeeId,
        targetManagerId: target.managerId,
        recipientName: target.manager?.name || 'Manager',
        reason: `HR returned ${target.employee.name} to ${target.manager?.name || 'manager'}: ${comment}`,
      });
      showToast(t.toastHrReturned, 'warning');
    },
    [reviews, currentUser, appendLog, showToast, t.toastHrReturned]
  );

  const handlePublishReady = useCallback(() => {
    const nowIso = new Date().toISOString();
    const targets = reviews.filter((r) => r.status === 'MANAGER_APPROVED');
    if (targets.length === 0) return;

    setReviews((prev) =>
      prev.map((r) => {
        if (r.status !== 'MANAGER_APPROVED') return r;
        const entry = makeComment(r, {
          phase: 'RELEASE',
          actorName: currentUser?.name || 'HR Admin',
          actorRole: 'HR_ADMIN',
          action: 'PUBLISHED',
          comment: 'HR approved and published final annual performance outcome.',
        });
        return {
          ...r,
          status: 'PUBLISHED',
          publishedAt: nowIso,
          commentHistory: [...(r.commentHistory || []), entry],
        };
      })
    );

    const newLogs = [
      {
        id: `aud-${Date.now()}-batch`,
        action: 'HR_PUBLISH_BATCH',
        actorId: currentUser?.id || 'usr-hr',
        actorName: currentUser?.name || 'HR Admin',
        visibilityScope: 'HR_INTERNAL',
        targetEmployeeId: null,
        targetManagerId: null,
        reason: `HR Approve & Publish released ${targets.length} manager-approved review(s) to employees.`,
        createdAt: nowIso,
      },
      ...targets.map((target, idx) => ({
        id: `aud-${Date.now()}-${idx}`,
        action: 'PUBLISH',
        actorId: currentUser?.id || 'usr-hr',
        actorName: currentUser?.name || 'HR Admin',
        visibilityScope: 'PUBLIC_SELF',
        targetEmployeeId: target.employeeId,
        targetManagerId: target.managerId,
        reason: `HR Approve & Publish released final review outcome for ${target.employee.name}.`,
        createdAt: nowIso,
      })),
    ];

    setAuditLogs((prev) => [...newLogs, ...prev]);
    showToast(t.toastPublished, 'success');
  }, [reviews, currentUser, showToast, t.toastPublished]);

  const handleUpdateStageDeadlines = useCallback(
    (datesPatch) => {
      setCycle((prev) => ({
        ...prev,
        ...datesPatch,
        managerDeadline: datesPatch.stage2ApprovalDeadline || prev.managerDeadline,
      }));
      appendLog({
        action: 'UPDATE_STAGE_DEADLINES',
        visibilityScope: 'CYCLE_GOVERNANCE',
        reason: 'Updated 3-Stage Due Dates (OKR Draft / Manager 5d SLA / HRBP Audit & Publish fixed window).',
      });
      showToast(t.toastStageDatesSaved, 'success');
    },
    [appendLog, showToast, t.toastStageDatesSaved]
  );

  const handleToggleGracePeriod = useCallback(() => {
    const next = !cycle.isGracePeriodActive;
    setCycle((prev) => ({ ...prev, isGracePeriodActive: next }));
    appendLog({
      action: next ? 'ENABLE_GRACE_PERIOD' : 'DISABLE_GRACE_PERIOD',
      visibilityScope: 'CYCLE_GOVERNANCE',
      reason: next ? 'Enabled cycle grace period.' : 'Disabled cycle grace period.',
    });
    showToast(t.toastCycleUpdated, 'success');
  }, [cycle.isGracePeriodActive, appendLog, showToast, t.toastCycleUpdated]);

  const handleToggleLockCycle = useCallback(() => {
    const next = !cycle.isLocked;
    setCycle((prev) => ({ ...prev, isLocked: next }));
    appendLog({
      action: next ? 'LOCK_CYCLE' : 'UNLOCK_CYCLE',
      visibilityScope: 'CYCLE_GOVERNANCE',
      reason: next ? 'Locked review cycle.' : 'Reopened review cycle.',
    });
    showToast(t.toastCycleUpdated, 'warning');
  }, [cycle.isLocked, appendLog, showToast, t.toastCycleUpdated]);

  const handleNudge = useCallback(
    (reviewId) => {
      const nowIso = new Date().toISOString();
      const rev = reviews.find((r) => r.id === reviewId);
      const isEmpStage = [
        'GOAL_DRAFT',
        'GOAL_REVISION_REQUIRED',
        'GOAL_APPROVED',
        'REVIEW_REVISION_REQUIRED',
      ].includes(rev?.status);
      const hrName = currentUser?.name || 'Pluem Srisuk';
      const hrNameTh = currentUser?.nameTh || hrName;

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                lastNudgedAt: nowIso,
                lastNudgedBy: hrName,
                lastNudgedByTh: hrNameTh,
                lastNudgedTarget: isEmpStage ? 'EMPLOYEE' : 'MANAGER',
              }
            : r
        )
      );
      appendLog({
        action: 'NUDGE',
        visibilityScope: isEmpStage ? 'PUBLIC_SELF' : 'TEAM_MANAGER',
        targetEmployeeId: rev?.employeeId || null,
        targetManagerId: rev?.managerId || null,
        recipientName: isEmpStage
          ? rev?.employee?.name || null
          : rev?.manager?.name || null,
        reason: `Sent overdue SLA reminder for ${rev?.employee?.name || reviewId} (${isEmpStage ? 'Employee' : 'Manager'} pending).`,
      });
      showToast(t.toastNudged, 'success');
    },
    [reviews, currentUser, appendLog, showToast, t.toastNudged]
  );

  const handleExtendDeadline = useCallback(
    (reviewId, reason, extraDays = 5) => {
      const days = Math.min(30, Math.max(1, Number(extraDays) || 5));
      const extended = new Date(Date.now() + days * 86400000).toISOString();
      const rev = reviews.find((r) => r.id === reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, extendedDeadline: extended, isOverdue: false, daysOverdue: 0 } : r))
      );
      appendLog({
        action: 'EXTEND_DEADLINE',
        visibilityScope: 'PUBLIC_SELF',
        targetEmployeeId: rev?.employeeId || null,
        targetManagerId: rev?.managerId || null,
        recipientName: rev?.employee?.name || null,
        reason: `${reason} (+${days} days for ${rev?.employee?.name || reviewId})`,
      });
      showToast((t.toastExtended || 'Deadline extended by {d} days.').replace('{d}', String(days)), 'success');
    },
    [reviews, appendLog, showToast, t.toastExtended]
  );

  const handleEscalate = useCallback(
    (reviewId, reason) => {
      const rev = reviews.find((r) => r.id === reviewId);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, escalatedToSkipLevel: true } : r)));
      appendLog({
        action: 'ESCALATE',
        visibilityScope: 'HR_INTERNAL',
        targetEmployeeId: rev?.employeeId || null,
        targetManagerId: rev?.managerId || null,
        recipientName: rev?.employee?.department ? `Skip-Level (${rev.employee.department})` : 'Skip-Level Leader',
        reason: `Internal Escalation (${rev?.employee?.name || reviewId}): ${reason}`,
      });
      showToast(t.toastEscalated, 'warning');
    },
    [reviews, appendLog, showToast, t.toastEscalated]
  );

  return {
    cycle,
    reviews: enrichedReviews,
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
    showToast,
    dismissToast,
    can,
    handleLogin,
    handleRegister,
    handleInviteUser,
    handleActivateInvite,
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
    handlePostHrbpAdvisorComment,
    handleHrReturnToManager,
    handlePublishReady,
    handleUpdateStageDeadlines,
    handleToggleGracePeriod,
    handleToggleLockCycle,
    handleNudge,
    handleExtendDeadline,
    handleEscalate,
  };
}
