import {
  computeOrgDistribution,
  computeReviewScores,
  getHrbpInterventionInfo,
  getOverdueInfo,
  sanitizeReviewForRole,
} from '../services/scoringService.js';
import {
  appendAuditLog,
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
  const intervention = getHrbpInterventionInfo(review, cycle);

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
    goals,
    ...overdue,
    ...intervention,
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
    return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the employee can edit their own OKRs.' } });
  }
  if (!['GOAL_DRAFT', 'GOAL_REVISION_REQUIRED'].includes(review.status)) {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'OKRs are locked in the current stage.' } });
  }

  const { goals, comment, submit } = req.validatedBody;
  replaceGoalsForEmployee(review.employeeId, cycle.id, goals);

  const nowIso = new Date().toISOString();
  const nextRound = review.status === 'GOAL_REVISION_REQUIRED' ? (review.revisionRound || 1) + 1 : review.revisionRound || 1;
  let updated = updateReview(reviewId, {
    revisionRound: nextRound,
    ...(submit ? { status: 'GOAL_PENDING_APPROVAL', goalsSubmittedAt: nowIso } : {}),
  });

  if (submit) {
    updated = appendReviewComment(reviewId, {
      phase: 'GOAL',
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'GOAL_SUBMITTED',
      comment: comment || `Submitted ${goals.length} OKR(s) totaling 100% weight for manager approval.`,
    });

    appendAuditLog({
      cycleId: cycle.id,
      reviewId,
      actor: req.user,
      action: 'GOAL_SUBMITTED',
      visibilityScope: 'PUBLIC_SELF',
      targetEmployeeId: review.employeeId,
      targetManagerId: review.managerId,
      reason: `${req.user.name} submitted ${goals.length} OKR(s) (Round ${nextRound}) totaling 100% weight.`,
      metadata: { round: nextRound, goalCount: goals.length },
    });
  }

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: nowIso },
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
    return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'Only the assigned manager can review these OKRs.' } });
  }
  if (review.status !== 'GOAL_PENDING_APPROVAL') {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'OKRs can only be approved or returned while pending manager approval.' } });
  }

  const { decision, comment, adjustedGoals } = req.validatedBody;
  const isApprove = decision === 'APPROVE';
  const nextStatus = isApprove ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUIRED';
  const nowIso = new Date().toISOString();

  // Manager co-edit Weight % & Multiplier on Approve with transparent before->after audit diff
  const adjustments = [];
  if (isApprove && Array.isArray(adjustedGoals) && adjustedGoals.length > 0) {
    const currentGoals = getGoalsByEmployee(review.employeeId);
    const adjMap = new Map(adjustedGoals.map((g) => [g.id, g]));
    const nextGoals = currentGoals.map((g) => {
      const adj = adjMap.get(g.id);
      if (!adj) return g;
      if (adj.weight !== g.weight || adj.multiplier !== g.multiplier) {
        adjustments.push(
          `"${g.title}": Weight ${g.weight}% -> ${adj.weight}%, Multiplier ${g.multiplier}x -> ${adj.multiplier}x`
        );
      }
      return { ...g, weight: adj.weight, multiplier: adj.multiplier };
    });
    replaceGoalsForEmployee(review.employeeId, cycle.id, nextGoals);
  }

  const diffNote = adjustments.length > 0 ? ` [Manager adjusted: ${adjustments.join(' | ')}]` : '';
  const finalComment =
    (comment || (isApprove ? 'OKRs approved and locked for execution.' : '')) + diffNote;

  updateReview(reviewId, {
    status: nextStatus,
    ...(isApprove ? { goalsApprovedAt: nowIso } : {}),
  });

  const updated = appendReviewComment(reviewId, {
    phase: 'GOAL',
    actorName: req.user.name,
    actorRole: req.user.role,
    action: isApprove ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUESTED',
    comment: finalComment,
  });

  appendAuditLog({
    cycleId: cycle.id,
    reviewId,
    actor: req.user,
    action: isApprove ? 'GOAL_APPROVED' : 'GOAL_REVISION_REQUESTED',
    visibilityScope: 'PUBLIC_SELF',
    targetEmployeeId: review.employeeId,
    targetManagerId: review.managerId,
    reason: finalComment,
    metadata: { adjustmentsCount: adjustments.length },
  });

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: nowIso },
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
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'OKRs must be approved before submitting self-review.' } });
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

  const nowIso = new Date().toISOString();
  let updated = updateReview(reviewId, {
    selfPayload: payload,
    ...(submit ? { status: 'SELF_REVIEW_SUBMITTED', selfSubmittedAt: nowIso } : {}),
  });

  if (submit) {
    updated = appendReviewComment(reviewId, {
      phase: 'REVIEW',
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'SELF_REVIEW_SUBMITTED',
      comment: payload.reflection || 'Submitted self-review achievements and self scores.',
    });

    appendAuditLog({
      cycleId: cycle.id,
      reviewId,
      actor: req.user,
      action: 'SELF_REVIEW_SUBMITTED',
      visibilityScope: 'PUBLIC_SELF',
      targetEmployeeId: review.employeeId,
      targetManagerId: review.managerId,
      reason: `${req.user.name} submitted OKR achievements and self-review.`,
    });
  }

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: nowIso },
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
  if (review.status !== 'SELF_REVIEW_SUBMITTED') {
    return res.status(409).json({ ok: false, error: { code: 'CONFLICT', message: 'Only submitted self-reviews can be returned to the employee.' } });
  }

  const nextRound = (review.revisionRound || 1) + 1;
  updateReview(reviewId, {
    status: 'REVIEW_REVISION_REQUIRED',
    revisionRound: nextRound,
  });

  const updated = appendReviewComment(reviewId, {
    phase: 'REVIEW',
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'REVIEW_REVISION_REQUESTED',
    comment: req.validatedBody.comment,
  });

  appendAuditLog({
    cycleId: cycle.id,
    reviewId,
    actor: req.user,
    action: 'REVIEW_REVISION_REQUESTED',
    visibilityScope: 'PUBLIC_SELF',
    targetEmployeeId: review.employeeId,
    targetManagerId: review.managerId,
    reason: `Returned self-review (Round ${nextRound}): ${req.validatedBody.comment}`,
    metadata: { round: nextRound },
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

  const nowIso = new Date().toISOString();
  let updated = updateReview(reviewId, {
    managerPayload: payload,
    ...scores,
    ...(submit ? { status: 'MANAGER_APPROVED', managerSubmittedAt: nowIso } : {}),
  });

  if (submit) {
    updated = appendReviewComment(reviewId, {
      phase: 'REVIEW',
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'MANAGER_APPROVED',
      comment: payload.managerSummary || 'Manager evaluation approved and forwarded to HR review.',
    });

    // Strict Privacy: Manager score submission is TEAM_MANAGER scoped (NEVER shown to employee before PUBLISHED)
    appendAuditLog({
      cycleId: cycle.id,
      reviewId,
      actor: req.user,
      action: 'MANAGER_APPROVED',
      visibilityScope: 'TEAM_MANAGER',
      targetEmployeeId: review.employeeId,
      targetManagerId: review.managerId,
      reason: `Manager submitted evaluation (Score: ${scores.overallScore}) to HR Approve & Publish queue.`,
      metadata: { overallScore: scores.overallScore },
    });
  }

  return res.json({
    ok: true,
    data: { review: enrichReview(updated, req.user, getUsersMap(), cycle) },
    meta: { timestamp: nowIso },
  });
}
