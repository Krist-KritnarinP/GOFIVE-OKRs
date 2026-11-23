import {
  computeOrgDistribution,
  computeReviewScores,
  getOverdueInfo,
  sanitizeReviewForRole,
} from '../services/scoringService.js';
import {
  getAllReviews,
  getCycle,
  getGoalsByEmployee,
  getReviewByEmployee,
  getReviewById,
  getTeamReviews,
  getUsersMap,
  updateReview,
} from '../services/storeService.js';

function enrichReview(review, user, usersMap, cycle) {
  const employee = usersMap.get(review.employeeId);
  const manager = review.managerId ? usersMap.get(review.managerId) : null;
  const goals = getGoalsByEmployee(review.employeeId);
  const overdue = getOverdueInfo(review, cycle);

  const sanitized = sanitizeReviewForRole(review, user);

  return {
    ...sanitized,
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
    goals,
    ...overdue,
  };
}

export function getMyReview(req, res) {
  const cycle = getCycle();
  const usersMap = getUsersMap();
  const review = getReviewByEmployee(req.user.id);

  if (!review) {
    return res.json({
      ok: true,
      data: { review: null, cycle },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  return res.json({
    ok: true,
    data: { review: enrichReview(review, req.user, usersMap, cycle), cycle },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function getMyTeamReviews(req, res) {
  const cycle = getCycle();
  const usersMap = getUsersMap();
  const rawReviews =
    req.user.role === 'HR_ADMIN' ? getAllReviews() : getTeamReviews(req.user.id);

  const reviews = rawReviews.map((r) => enrichReview(r, req.user, usersMap, cycle));
  const teamDistribution = computeOrgDistribution(rawReviews);
  const orgDistribution = computeOrgDistribution(getAllReviews());

  return res.json({
    ok: true,
    data: {
      cycle,
      reviews,
      teamDistribution,
      orgBenchmarkAvg: orgDistribution.orgAverageScore,
    },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function getSingleReview(req, res) {
  const { reviewId } = req.params;
  const review = getReviewById(reviewId);
  if (!review) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Review not found.' },
    });
  }

  const isOwner = review.employeeId === req.user.id;
  const isAssignedManager = review.managerId === req.user.id;
  const isHr = req.user.role === 'HR_ADMIN';

  if (!isOwner && !isAssignedManager && !isHr) {
    return res.status(403).json({
      ok: false,
      error: { code: 'FORBIDDEN', message: 'You cannot access this employee review.' },
    });
  }

  const cycle = getCycle();
  const usersMap = getUsersMap();
  return res.json({
    ok: true,
    data: { review: enrichReview(review, req.user, usersMap, cycle), cycle },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function saveSelfReview(req, res) {
  const { reviewId } = req.params;
  const cycle = getCycle();
  const review = getReviewById(reviewId);

  if (!review) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Review not found.' },
    });
  }

  if (review.employeeId !== req.user.id) {
    return res.status(403).json({
      ok: false,
      error: { code: 'FORBIDDEN', message: 'Only the employee can update their self-review.' },
    });
  }

  if (cycle.isLocked && !cycle.isGracePeriodActive) {
    return res.status(409).json({
      ok: false,
      error: { code: 'CONFLICT', message: 'The review cycle is locked.' },
    });
  }

  if (review.status !== 'DRAFT') {
    return res.status(409).json({
      ok: false,
      error: { code: 'CONFLICT', message: 'Self-review has already been submitted.' },
    });
  }

  const { submit, ...payload } = req.validatedBody;
  const updated = updateReview(reviewId, {
    selfPayload: payload,
    ...(submit ? { status: 'SELF_REVIEW_SUBMITTED', selfSubmittedAt: new Date().toISOString() } : {}),
  });

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function saveManagerReview(req, res) {
  const { reviewId } = req.params;
  const cycle = getCycle();
  const review = getReviewById(reviewId);

  if (!review) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Review not found.' },
    });
  }

  const isAssignedManager = review.managerId === req.user.id;
  const isHr = req.user.role === 'HR_ADMIN';

  if (!isAssignedManager && !isHr) {
    return res.status(403).json({
      ok: false,
      error: { code: 'FORBIDDEN', message: 'Only the assigned manager or HR can evaluate this review.' },
    });
  }

  if (cycle.isLocked && !cycle.isGracePeriodActive && !isHr) {
    return res.status(409).json({
      ok: false,
      error: { code: 'CONFLICT', message: 'The review cycle is locked by HR.' },
    });
  }

  if (review.status === 'PUBLISHED') {
    return res.status(409).json({
      ok: false,
      error: { code: 'CONFLICT', message: 'Cannot modify a published review.' },
    });
  }

  const { submit, ...payload } = req.validatedBody;
  const goals = getGoalsByEmployee(review.employeeId);
  const scores = computeReviewScores({
    goals,
    goalRatings: payload.goalRatings,
    competencyRatings: payload.competencyRatings,
    cycle,
  });

  const updated = updateReview(reviewId, {
    managerPayload: payload,
    ...scores,
    ...(submit
      ? { status: 'READY_FOR_RELEASE', managerSubmittedAt: new Date().toISOString() }
      : {}),
  });

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: new Date().toISOString() },
  });
}
