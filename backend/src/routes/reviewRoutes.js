import { Router } from 'express';
import {
  getMyReview,
  getMyTeamReviews,
  getSingleReview,
  saveManagerReview,
  saveSelfReview,
} from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { managerReviewSchema, selfReviewSchema } from '../schemas/reviewSchemas.js';

const router = Router();

router.get('/me', requireAuth, getMyReview);
router.get('/team', requireAuth, requireRole('MANAGER', 'HR_ADMIN'), getMyTeamReviews);
router.get('/:reviewId', requireAuth, getSingleReview);
router.put('/:reviewId/self-review', requireAuth, validateBody(selfReviewSchema), saveSelfReview);
router.put(
  '/:reviewId/manager-review',
  requireAuth,
  requireRole('MANAGER', 'HR_ADMIN'),
  validateBody(managerReviewSchema),
  saveManagerReview
);

export default router;
