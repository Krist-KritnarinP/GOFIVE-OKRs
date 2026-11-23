import {
  computeBiasAlerts,
  computeOrgDistribution,
  getOverdueInfo,
} from '../services/scoringService.js';
import {
  appendAuditLog,
  getAllReviews,
  getAuditLogs,
  getCycle,
  getGoalsByEmployee,
  getReviewById,
  getUsersMap,
  updateReview,
} from '../services/storeService.js';

export function getHrOverview(_req, res) {
  const cycle = getCycle();
  const reviews = getAllReviews();
  const usersMap = getUsersMap();

  const { buckets, totalScored, orgAverageScore } = computeOrgDistribution(reviews);
  const biasAlerts = computeBiasAlerts(reviews, usersMap);

  const enriched = reviews.map((review) => {
    const employee = usersMap.get(review.employeeId);
    const manager = review.managerId ? usersMap.get(review.managerId) : null;
    const overdue = getOverdueInfo(review, cycle);
    return {
      ...review,
      employee: employee
        ? {
            id: employee.id,
            name: employee.name,
            nameTh: employee.nameTh,
            title: employee.title,
            department: employee.department,
          }
        : null,
      manager: manager
        ? {
            id: manager.id,
            name: manager.name,
            nameTh: manager.nameTh,
            department: manager.department,
          }
        : null,
      goals: getGoalsByEmployee(review.employeeId),
      ...overdue,
    };
  });

  const exceptions = enriched.filter((r) => r.isOverdue || r.escalatedToSkipLevel);
  const completedCount = enriched.filter(
    (r) => r.status === 'READY_FOR_RELEASE' || r.status === 'PUBLISHED'
  ).length;
  const publishedCount = enriched.filter((r) => r.status === 'PUBLISHED').length;
  const readyCount = enriched.filter((r) => r.status === 'READY_FOR_RELEASE').length;

  return res.json({
    ok: true,
    data: {
      cycle,
      summary: {
        totalEmployees: enriched.length,
        completedCount,
        completionPct: enriched.length > 0 ? Math.round((completedCount / enriched.length) * 100) : 0,
        readyToPublishCount: readyCount,
        publishedCount,
        overdueCount: enriched.filter((r) => r.isOverdue).length,
        orgAverageScore,
        biasAlertCount: biasAlerts.length,
        totalScored,
      },
      distribution: buckets,
      biasAlerts,
      reviews: enriched,
      exceptions,
      auditLogs: getAuditLogs(),
    },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function nudgeReview(req, res) {
  const { reviewId } = req.params;
  const review = getReviewById(reviewId);
  if (!review) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Review not found.' },
    });
  }

  const nowIso = new Date().toISOString();
  const updated = updateReview(reviewId, { lastNudgedAt: nowIso });
  const log = appendAuditLog({
    cycleId: review.cycleId,
    reviewId,
    actor: req.user,
    action: 'NUDGE',
    reason: req.validatedBody.message || 'Sent overdue reminder nudge to pending reviewer.',
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
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Review not found.' },
    });
  }

  const { extraDays, reason } = req.validatedBody;
  const newDeadline = new Date(Date.now() + extraDays * 86400000).toISOString();
  const updated = updateReview(reviewId, { extendedDeadline: newDeadline });
  const log = appendAuditLog({
    cycleId: review.cycleId,
    reviewId,
    actor: req.user,
    action: 'EXTEND_DEADLINE',
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
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Review not found.' },
    });
  }

  const { reason } = req.validatedBody;
  const updated = updateReview(reviewId, { escalatedToSkipLevel: true });
  const log = appendAuditLog({
    cycleId: review.cycleId,
    reviewId,
    actor: req.user,
    action: 'ESCALATE',
    reason,
    metadata: { escalatedToSkipLevel: true },
  });

  return res.json({
    ok: true,
    data: { review: updated, auditLog: log },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function publishCycleResults(req, res) {
  const { cycleId } = req.params;
  const cycle = getCycle();
  if (cycle.id !== cycleId) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Review cycle not found.' },
    });
  }

  const { reviewIds } = req.validatedBody;
  const targets = getAllReviews().filter((r) => {
    if (r.status !== 'READY_FOR_RELEASE') return false;
    if (reviewIds && reviewIds.length > 0) return reviewIds.includes(r.id);
    return true;
  });

  const nowIso = new Date().toISOString();
  for (const target of targets) {
    updateReview(target.id, { status: 'PUBLISHED', publishedAt: nowIso });
  }

  const log = appendAuditLog({
    cycleId: cycle.id,
    actor: req.user,
    action: 'PUBLISH',
    reason: `Published ${targets.length} completed review(s) to employees.`,
    metadata: { publishedIds: targets.map((t) => t.id), count: targets.length },
  });

  return res.json({
    ok: true,
    data: { publishedCount: targets.length, auditLog: log },
    meta: { timestamp: nowIso },
  });
}

export function listAuditLogs(_req, res) {
  res.json({
    ok: true,
    data: { auditLogs: getAuditLogs() },
    meta: { timestamp: new Date().toISOString() },
  });
}
