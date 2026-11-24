import {
  computeBiasAlerts,
  computeOrgDistribution,
  filterActivityLogsForUser,
  getHrbpInterventionInfo,
  getOverdueInfo,
} from '../services/scoringService.js';
import {
  appendAuditLog,
  appendReviewComment,
  getAllReviews,
  getAuditLogs,
  getCycle,
  getGoalsByEmployee,
  getReviewById,
  getUsersMap,
  updateReview,
} from '../services/storeService.js';

export function getHrOverview(req, res) {
  const cycle = getCycle();
  const reviews = getAllReviews();
  const usersMap = getUsersMap();

  const { buckets, totalScored, orgAverageScore } = computeOrgDistribution(reviews);
  const biasAlerts = computeBiasAlerts(reviews, usersMap);

  const enriched = reviews.map((review) => {
    const employee = usersMap.get(review.employeeId);
    const manager = review.managerId ? usersMap.get(review.managerId) : null;
    const overdue = getOverdueInfo(review, cycle);
    const intervention = getHrbpInterventionInfo(review, cycle);
    return {
      ...review,
      employee: employee
        ? {
            id: employee.id,
            name: employee.name,
            nameTh: employee.nameTh,
            title: employee.title,
            department: employee.department,
            jobLevel: employee.jobLevel || 'L2_MID',
          }
        : null,
      manager: manager
        ? {
            id: manager.id,
            name: manager.name,
            nameTh: manager.nameTh,
            department: manager.department,
            jobLevel: manager.jobLevel || 'L4_LEAD',
          }
        : null,
      goals: getGoalsByEmployee(review.employeeId),
      ...overdue,
      ...intervention,
    };
  });

  const exceptions = enriched.filter(
    (r) => r.isOverdue || r.escalatedToSkipLevel || r.hrbpInterventionNeeded
  );
  const completedCount = enriched.filter((r) =>
    ['MANAGER_APPROVED', 'PUBLISHED'].includes(r.status)
  ).length;
  const publishedCount = enriched.filter((r) => r.status === 'PUBLISHED').length;
  const readyToPublishCount = enriched.filter((r) => r.status === 'MANAGER_APPROVED').length;

  return res.json({
    ok: true,
    data: {
      cycle,
      summary: {
        totalEmployees: enriched.length,
        completedCount,
        completionPct: enriched.length > 0 ? Math.round((completedCount / enriched.length) * 100) : 0,
        readyToPublishCount,
        publishedCount,
        overdueCount: enriched.filter((r) => r.isOverdue).length,
        hrbpAlertCount: enriched.filter((r) => r.hrbpInterventionNeeded).length,
        orgAverageScore,
        biasAlertCount: biasAlerts.length,
        totalScored,
      },
      distribution: buckets,
      biasAlerts,
      reviews: enriched,
      exceptions,
      auditLogs: filterActivityLogsForUser(getAuditLogs(), req.user),
    },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function nudgeReview(req, res) {
  const { reviewId } = req.params;
  const review = getReviewById(reviewId);
  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }

  const nowIso = new Date().toISOString();
  const updated = updateReview(reviewId, { lastNudgedAt: nowIso });
  const log = appendAuditLog({
    cycleId: review.cycleId,
    reviewId,
    actor: req.user,
    action: 'NUDGE',
    visibilityScope: 'TEAM_MANAGER',
    targetEmployeeId: review.employeeId,
    targetManagerId: review.managerId,
    reason: req.validatedBody.message || 'Sent overdue SLA reminder nudge to pending reviewer.',
  });

  return res.json({
    ok: true,
    data: { review: updated, auditLog: log },
    meta: { timestamp: nowIso },
  });
}

export function extendReviewDeadline(req, res) {
  const { reviewId } = req.params;
  const review = getReviewById(reviewId);
  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }

  const { extraDays, reason } = req.validatedBody;
  const newDeadline = new Date(Date.now() + extraDays * 86400000).toISOString();
  const updated = updateReview(reviewId, { extendedDeadline: newDeadline });
  const log = appendAuditLog({
    cycleId: review.cycleId,
    reviewId,
    actor: req.user,
    action: 'EXTEND_DEADLINE',
    visibilityScope: 'PUBLIC_SELF',
    targetEmployeeId: review.employeeId,
    targetManagerId: review.managerId,
    reason,
    metadata: { extraDays, extendedDeadline: newDeadline },
  });

  return res.json({
    ok: true,
    data: { review: updated, auditLog: log },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function escalateReview(req, res) {
  const { reviewId } = req.params;
  const review = getReviewById(reviewId);
  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }

  const { reason } = req.validatedBody;
  const updated = updateReview(reviewId, { escalatedToSkipLevel: true });
  const log = appendAuditLog({
    cycleId: review.cycleId,
    reviewId,
    actor: req.user,
    action: 'ESCALATE',
    visibilityScope: 'HR_INTERNAL',
    targetEmployeeId: review.employeeId,
    targetManagerId: review.managerId,
    reason,
    metadata: { escalatedToSkipLevel: true },
  });

  return res.json({
    ok: true,
    data: { review: updated, auditLog: log },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function postHrbpAdvisorComment(req, res) {
  const { reviewId } = req.params;
  const review = getReviewById(reviewId);
  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }

  const { comment } = req.validatedBody;
  const updated = appendReviewComment(reviewId, {
    phase: 'HRBP_ADVISOR',
    actorName: req.user.name,
    actorRole: 'HR_ADMIN',
    action: 'HRBP_ADVISOR_COMMENT',
    comment,
  });

  const log = appendAuditLog({
    cycleId: review.cycleId,
    reviewId,
    actor: req.user,
    action: 'HRBP_ADVISOR_COMMENT',
    visibilityScope: 'PUBLIC_SELF',
    targetEmployeeId: review.employeeId,
    targetManagerId: review.managerId,
    reason: `HRBP Facilitator Note: ${comment}`,
  });

  return res.json({
    ok: true,
    data: { review: updated, auditLog: log },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function returnReviewToManager(req, res) {
  const { reviewId } = req.params;
  const review = getReviewById(reviewId);
  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }
  if (review.status !== 'MANAGER_APPROVED') {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'Only manager-approved reviews can be returned to the manager.' } });
  }

  updateReview(reviewId, {
    status: 'SELF_REVIEW_SUBMITTED',
    revisionRound: (review.revisionRound || 1) + 1,
  });

  const updated = appendReviewComment(reviewId, {
    phase: 'HR_REVIEW',
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'HR_RETURNED_TO_MANAGER',
    comment: req.validatedBody.comment,
  });

  const log = appendAuditLog({
    cycleId: review.cycleId,
    reviewId,
    actor: req.user,
    action: 'HR_RETURN_TO_MANAGER',
    visibilityScope: 'TEAM_MANAGER',
    targetEmployeeId: review.employeeId,
    targetManagerId: review.managerId,
    reason: req.validatedBody.comment,
  });

  return res.json({
    ok: true,
    data: { review: updated, auditLog: log },
    meta: { timestamp: new Date().toISOString() },
  });
}

// Approach A (Lean v1): HR Approve & Publish directly from MANAGER_APPROVED -> PUBLISHED
export function publishCycleResults(req, res) {
  const { cycleId } = req.params;
  const cycle = getCycle();
  if (cycle.id !== cycleId) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review cycle not found.' } });
  }

  const { reviewIds } = req.validatedBody;
  const targets = getAllReviews().filter((r) => {
    if (r.status !== 'MANAGER_APPROVED') return false;
    if (reviewIds && reviewIds.length > 0) return reviewIds.includes(r.id);
    return true;
  });

  const nowIso = new Date().toISOString();
  const usersMap = getUsersMap();
  for (const target of targets) {
    const emp = usersMap.get(target.employeeId);
    updateReview(target.id, { status: 'PUBLISHED', publishedAt: nowIso });
    appendReviewComment(target.id, {
      phase: 'RELEASE',
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PUBLISHED',
      comment: 'HR approved and published final annual performance outcome.',
    });
    appendAuditLog({
      cycleId: cycle.id,
      reviewId: target.id,
      actor: req.user,
      action: 'PUBLISH',
      visibilityScope: 'PUBLIC_SELF',
      targetEmployeeId: target.employeeId,
      targetManagerId: target.managerId,
      reason: `HR approved and published final review outcome for ${emp?.name || target.employeeId}.`,
    });
  }

  const batchLog = appendAuditLog({
    cycleId: cycle.id,
    actor: req.user,
    action: 'HR_PUBLISH_BATCH',
    visibilityScope: 'HR_INTERNAL',
    reason: `HR Approve & Publish released ${targets.length} review(s) to employees.`,
    metadata: { publishedIds: targets.map((t) => t.id), count: targets.length },
  });

  return res.json({
    ok: true,
    data: { publishedCount: targets.length, auditLog: batchLog },
    meta: { timestamp: nowIso },
  });
}

export function listAuditLogs(req, res) {
  res.json({
    ok: true,
    data: { auditLogs: filterActivityLogsForUser(getAuditLogs(), req.user) },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function listMyActivityLogs(req, res) {
  res.json({
    ok: true,
    data: { activityLogs: filterActivityLogsForUser(getAuditLogs(), req.user) },
    meta: { timestamp: new Date().toISOString() },
  });
}
