import {
  computeOrgDistribution,
  computeReviewScores,
  getOverdueInfo,
  sanitizeReviewForRole,
} from '../services/scoringService.js';
import {
  appendReviewComment,
  getAllReviews,
  getCycle,
  getGoalsByEmployee,
  getReviewByEmployee,
  getReviewById,
  getTeamReviews,
  getUsersMap,
  replaceGoalsForEmployee,
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
    req.user.role === 'HR_ADMIN' || req.user.role === 'SUPER_ADMIN'
      ? getAllReviews()
      : getTeamReviews(req.user.id);

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
  const isAdmin = req.user.role === 'HR_ADMIN' || req.user.role === 'SUPER_ADMIN';

  if (!isOwner && !isAssignedManager && !isAdmin) {
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

export function submitEmployeeGoals(req, res) {
  const { reviewId } = req.params;
  const cycle = getCycle();
  const review = getReviewById(reviewId);

  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }
  if (review.employeeId !== req.user.id) {
    return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the employee can edit their own goals.' } });
  }
  if (!['GOAL_DRAFT', 'GOAL_REVISION_REQUIRED'].includes(review.status)) {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'Goals are locked in the current stage.' } });
  }

  const { goals, comment, submit } = req.validatedBody;
  replaceGoalsForEmployee(review.employeeId, cycle.id, goals);

  const nextRound = review.status === 'GOAL_REVISION_REQUIRED' ? (review.revisionRound || 1) + 1 : review.revisionRound || 1;
  let updated = updateReview(reviewId, {
    revisionRound: nextRound,
    ...(submit ? { status: 'GOAL_PENDING_APPROVAL' } : {}),
  });

  if (submit) {
    updated = appendReviewComment(reviewId, {
      phase: 'GOAL',
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'GOAL_SUBMITTED',
      comment: comment || `Submitted ${goals.length} OKR/KPI goal(s) totaling 100% weight for approval.`,
    });
  }

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function decideEmployeeGoals(req, res) {
  const { reviewId } = req.params;
  const cycle = getCycle();
  const review = getReviewById(reviewId);

  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }
  const isAssignedManager = review.managerId === req.user.id;
  const isAdmin = req.user.role === 'HR_ADMIN' || req.user.role === 'SUPER_ADMIN';
  if (!isAssignedManager && !isAdmin) {
    return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the assigned manager can review these goals.' } });
  }

  const { decision, comment } = req.validatedBody;
  const nextStatus = decision === 'APPROVE' ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUIRED';

  updateReview(reviewId, { status: nextStatus });
  const updated = appendReviewComment(reviewId, {
    phase: 'GOAL',
    actorName: req.user.name,
    actorRole: req.user.role,
    action: decision === 'APPROVE' ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUESTED',
    comment: comment || (decision === 'APPROVE' ? 'Goals approved and locked for execution.' : ''),
  });

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function saveSelfReview(req, res) {
  const { reviewId } = req.params;
  const cycle = getCycle();
  const review = getReviewById(reviewId);

  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }
  if (review.employeeId !== req.user.id) {
    return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the employee can update their self-review.' } });
  }
  if (cycle.isLocked && !cycle.isGracePeriodActive) {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'The review cycle is locked.' } });
  }
  if (!['GOAL_APPROVED', 'REVIEW_REVISION_REQUIRED'].includes(review.status)) {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'Goals must be approved before submitting self-review.' } });
  }

  const { submit, ...payload } = req.validatedBody;
  const currentGoals = getGoalsByEmployee(review.employeeId);
  const updatedGoals = currentGoals.map((g) => {
    const match = payload.goalAssessments.find((a) => a.goalId === g.id);
    if (!match) return g;
    return {
      ...g,
      actualValue: match.actualValue ?? g.actualValue,
      progressPct: match.progressPct ?? g.progressPct,
    };
  });
  replaceGoalsForEmployee(review.employeeId, cycle.id, updatedGoals);

  let updated = updateReview(reviewId, {
    selfPayload: payload,
    ...(submit ? { status: 'SELF_REVIEW_SUBMITTED', selfSubmittedAt: new Date().toISOString() } : {}),
  });

  if (submit) {
    updated = appendReviewComment(reviewId, {
      phase: 'REVIEW',
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'SELF_REVIEW_SUBMITTED',
      comment: payload.reflection || 'Submitted self-review achievements and self scores.',
    });
  }

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function returnSelfReviewToEmployee(req, res) {
  const { reviewId } = req.params;
  const cycle = getCycle();
  const review = getReviewById(reviewId);

  if (!review) {
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }
  const isAssignedManager = review.managerId === req.user.id;
  const isAdmin = req.user.role === 'HR_ADMIN' || req.user.role === 'SUPER_ADMIN';
  if (!isAssignedManager && !isAdmin) {
    return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the assigned manager can return this self-review.' } });
  }

  updateReview(reviewId, {
    status: 'REVIEW_REVISION_REQUIRED',
    revisionRound: (review.revisionRound || 1) + 1,
  });

  const updated = appendReviewComment(reviewId, {
    phase: 'REVIEW',
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'REVIEW_REVISION_REQUESTED',
    comment: req.validatedBody.comment,
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
    return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } });
  }

  const isAssignedManager = review.managerId === req.user.id;
  const isAdmin = req.user.role === 'HR_ADMIN' || req.user.role === 'SUPER_ADMIN';

  if (!isAssignedManager && !isAdmin) {
    return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the assigned manager or HR can evaluate this review.' } });
  }
  if (cycle.isLocked && !cycle.isGracePeriodActive && !isAdmin) {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'The review cycle is locked by HR.' } });
  }
  if (review.status === 'PUBLISHED') {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'Cannot modify a published review.' } });
  }

  const { submit, ...payload } = req.validatedBody;
  const goals = getGoalsByEmployee(review.employeeId);
  const scores = computeReviewScores({
    goals,
    goalRatings: payload.goalRatings,
    competencyRatings: payload.competencyRatings,
    cycle,
  });

  let updated = updateReview(reviewId, {
    managerPayload: payload,
    ...scores,
    ...(submit
      ? { status: 'MANAGER_APPROVED', managerSubmittedAt: new Date().toISOString() }
      : {}),
  });

  if (submit) {
    updated = appendReviewComment(reviewId, {
      phase: 'REVIEW',
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'MANAGER_APPROVED',
      comment: payload.managerSummary || 'Manager evaluation approved and forwarded to HR Calibration.',
    });
  }

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: new Date().toISOString() },
  });
}
