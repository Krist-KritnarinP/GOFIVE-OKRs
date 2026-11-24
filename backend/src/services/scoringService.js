const ROUND2 = (n) => Math.round(n * 100) / 100;

export function computeNineBoxCell(whatPct, howScore) {
  if (whatPct == null || howScore == null) return null;

  const xBand = whatPct >= 90 ? 'HIGH' : whatPct >= 65 ? 'MID' : 'LOW';
  const yBand = howScore >= 4.0 ? 'HIGH' : howScore >= 2.6 ? 'MID' : 'LOW';

  const matrix = {
    'HIGH:HIGH': 'STAR_HIGH_PERFORMER',
    'MID:HIGH': 'HIGH_IMPACT_GROWTH',
    'LOW:HIGH': 'HIGH_POTENTIAL_EMERGING',
    'HIGH:MID': 'CONSISTENT_CONTRIBUTOR',
    'MID:MID': 'CORE_PERFORMER',
    'LOW:MID': 'DEVELOPING_TALENT',
    'HIGH:LOW': 'EFFECTIVE_SPECIALIST',
    'MID:LOW': 'INCONSISTENT_PERFORMER',
    'LOW:LOW': 'NEEDS_ACTION_LOW_PERFORMER',
  };

  return matrix[`${xBand}:${yBand}`] || 'CORE_PERFORMER';
}

export function computeReviewScores({ goals, goalRatings, competencyRatings, cycle }) {
  const goalMap = new Map(goals.map((g) => [g.id, g]));

  let totalWeight = 0;
  let weightedGoalScore = 0;
  let weightedProgress = 0;

  for (const rating of goalRatings) {
    const goal = goalMap.get(rating.goalId);
    const weight = goal ? goal.weight : 1;
    const multiplier = goal?.multiplier ?? 1.0;
    // Apply difficulty multiplier (1.0x / 1.1x / 1.2x) capped at 5.0 max for fairness
    const adjustedScore = Math.min(5, rating.score * multiplier);
    totalWeight += weight;
    weightedGoalScore += adjustedScore * weight;
    const ratingPct = (adjustedScore / 5) * 100;
    const blendedPct = goal ? goal.progressPct * 0.6 + ratingPct * 0.4 : ratingPct;
    weightedProgress += blendedPct * weight;
  }

  const whatScore = totalWeight > 0 ? ROUND2(weightedGoalScore / totalWeight) : 0;
  const whatPct = totalWeight > 0 ? ROUND2(weightedProgress / totalWeight) : 0;

  const howSum = competencyRatings.reduce((acc, item) => acc + item.score, 0);
  const howScore = competencyRatings.length > 0 ? ROUND2(howSum / competencyRatings.length) : 0;

  const whatWeightRatio = (cycle.whatWeight ?? 60) / 100;
  const howWeightRatio = (cycle.howWeight ?? 40) / 100;
  const overallScore = ROUND2(whatScore * whatWeightRatio + howScore * howWeightRatio);
  const nineBoxCell = computeNineBoxCell(whatPct, howScore);

  return { whatPct, whatScore, howScore, overallScore, nineBoxCell };
}

export function computeOrgDistribution(reviews) {
  const buckets = [1, 2, 3, 4, 5].map((score) => ({ score, count: 0, pct: 0 }));
  const scored = reviews.filter((r) => typeof r.overallScore === 'number');

  for (const review of scored) {
    const rounded = Math.min(5, Math.max(1, Math.round(review.overallScore)));
    buckets[rounded - 1].count += 1;
  }

  const total = scored.length;
  for (const bucket of buckets) {
    bucket.pct = total > 0 ? Math.round((bucket.count / total) * 100) : 0;
  }

  const orgAverageScore =
    total > 0 ? ROUND2(scored.reduce((acc, r) => acc + r.overallScore, 0) / total) : 0;

  return { buckets, totalScored: total, orgAverageScore };
}

export function computeBiasAlerts(reviews, usersMap) {
  const { orgAverageScore } = computeOrgDistribution(reviews);
  const byManager = new Map();

  for (const review of reviews) {
    if (!review.managerId || typeof review.overallScore !== 'number') continue;
    if (!byManager.has(review.managerId)) {
      byManager.set(review.managerId, []);
    }
    byManager.get(review.managerId).push(review);
  }

  const alerts = [];
  for (const [managerId, teamReviews] of byManager.entries()) {
    if (teamReviews.length < 2) continue;
    const manager = usersMap.get(managerId);
    const teamAvg = ROUND2(
      teamReviews.reduce((acc, r) => acc + r.overallScore, 0) / teamReviews.length
    );
    const delta = ROUND2(teamAvg - orgAverageScore);
    const topRatio =
      teamReviews.filter((r) => r.overallScore >= 4.6).length / teamReviews.length;
    const lowRatio =
      teamReviews.filter((r) => r.overallScore <= 2.3).length / teamReviews.length;

    if (delta >= 0.65 || topRatio >= 0.75) {
      alerts.push({
        managerId,
        managerName: manager?.name || 'Manager',
        department: manager?.department || '',
        teamSize: teamReviews.length,
        teamAvg,
        orgAvg: orgAverageScore,
        delta,
        flagType: 'LENIENCY_BIAS',
        explanation: `Team average (${teamAvg}) is +${delta} above org average (${orgAverageScore}), with ${Math.round(topRatio * 100)}% rated near 5.0.`,
        explanationTh: `คะแนนเฉลี่ยทีม (${teamAvg}) สูงกว่าค่าเฉลี่ยองค์กร (${orgAverageScore}) อยู่ +${delta} โดยมี ${Math.round(topRatio * 100)}% ได้คะแนนใกล้ 5.0`,
      });
    } else if (delta <= -0.65 || lowRatio >= 0.75) {
      alerts.push({
        managerId,
        managerName: manager?.name || 'Manager',
        department: manager?.department || '',
        teamSize: teamReviews.length,
        teamAvg,
        orgAvg: orgAverageScore,
        delta,
        flagType: 'SEVERITY_BIAS',
        explanation: `Team average (${teamAvg}) is ${delta} below org average (${orgAverageScore}).`,
        explanationTh: `คะแนนเฉลี่ยทีม (${teamAvg}) ต่ำกว่าค่าเฉลี่ยองค์กร (${orgAverageScore}) อยู่ ${delta}`,
      });
    }
  }

  return alerts;
}

export function getOverdueInfo(review, cycle, now = new Date()) {
  if (
    review.status === 'MANAGER_APPROVED' ||
    review.status === 'CALIBRATION_LOCKED' ||
    review.status === 'PUBLISHED'
  ) {
    return { isOverdue: false, daysOverdue: 0, missingActor: null };
  }

  const isEmployeeStage = [
    'GOAL_DRAFT',
    'GOAL_REVISION_REQUIRED',
    'GOAL_APPROVED',
    'REVIEW_REVISION_REQUIRED',
  ].includes(review.status);

  const effectiveDeadline = review.extendedDeadline
    ? new Date(review.extendedDeadline)
    : isEmployeeStage
      ? new Date(cycle.selfDeadline)
      : new Date(cycle.managerDeadline);

  const diffMs = now.getTime() - effectiveDeadline.getTime();
  if (diffMs <= 0) {
    return { isOverdue: false, daysOverdue: 0, missingActor: null };
  }

  const daysOverdue = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const missingActor = isEmployeeStage ? 'EMPLOYEE' : 'MANAGER';
  return { isOverdue: true, daysOverdue, missingActor };
}

/**
 * Security Gate Serializer:
 * Employees MUST NEVER receive manager ratings, comments, or 9-box placement before PUBLISHED.
 */
export function sanitizeReviewForRole(review, user) {
  if (user.role === 'EMPLOYEE' && review.status !== 'PUBLISHED') {
    return {
      ...review,
      managerPayload: null,
      whatPct: null,
      whatScore: null,
      howScore: null,
      overallScore: null,
      nineBoxCell: null,
      resultsLocked: true,
    };
  }
  return {
    ...review,
    resultsLocked: false,
  };
}
