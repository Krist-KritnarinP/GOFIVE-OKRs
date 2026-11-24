import { Router } from 'express';
import {
  decideEmployeeGoals,
  getMyReview,
  getMyTeamReviews,
  getSingleReview,
  returnSelfReviewToEmployee,
  saveManagerReview,
  saveSelfReview,
  submitEmployeeGoals,
} from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  goalDecisionSchema,
  managerReviewSchema,
  reviewReturnSchema,
  selfReviewSchema,
  submitGoalsSchema,
} from '../schemas/reviewSchemas.js';

const router = Router();

router.get('/me', requireAuth, getMyReview);
router.get('/team', requireAuth, requireRole('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'), getMyTeamReviews);
router.get('/:reviewId', requireAuth, getSingleReview);
router.put('/:reviewId/goals', requireAuth, validateBody(submitGoalsSchema), submitEmployeeGoals);
router.post(
  '/:reviewId/goals/decision',
  requireAuth,
  requireRole('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'),
  validateBody(goalDecisionSchema),
  decideEmployeeGoals
);
router.put('/:reviewId/self-review', requireAuth, validateBody(selfReviewSchema), saveSelfReview);
router.post(
  '/:reviewId/return-to-employee',
  requireAuth,
  requireRole('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'),
  validateBody(reviewReturnSchema),
  returnSelfReviewToEmployee
);
router.put(
  '/:reviewId/manager-review',
  requireAuth,
  requireRole('MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'),
  validateBody(managerReviewSchema),
  saveManagerReview
);

export default router;
