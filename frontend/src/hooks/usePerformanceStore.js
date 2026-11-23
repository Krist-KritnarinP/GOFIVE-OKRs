import { useState, useCallback, useMemo } from 'react';
import {
  computeAnalytics,
  computeScoresClient,
  createInitialClientState,
} from '../constants/initialData.js';
import { ROLES } from '../constants/roles.js';

export function usePerformanceStore(t) {
  const initial = useMemo(() => createInitialClientState(), []);
  const [cycle, setCycle] = useState(initial.cycle);
  const [reviews, setReviews] = useState(initial.reviews);
  const [auditLogs, setAuditLogs] = useState(initial.auditLogs);

  const [activeRole, setActiveRole] = useState(ROLES.HR_ADMIN);
  const [activeManagerId, setActiveManagerId] = useState('usr-mgr-eng');
  const [activeEmployeeId, setActiveEmployeeId] = useState('usr-emp-nida');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const analytics = useMemo(() => computeAnalytics(reviews), [reviews]);

  const appendLog = useCallback((action, reason, actorName = 'Pluem Srisuk') => {
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        action,
        actorName,
        reason,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

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
    analytics,
    activeRole,
    setActiveRole,
    activeManagerId,
    setActiveManagerId,
    activeEmployeeId,
    setActiveEmployeeId,
    toast,
    dismissToast,
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
