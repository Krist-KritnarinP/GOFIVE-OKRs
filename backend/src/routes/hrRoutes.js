import { Router } from 'express';
import {
  escalateReview,
  extendReviewDeadline,
  getHrOverview,
  listAuditLogs,
  nudgeReview,
  publishCycleResults,
} from '../controllers/hrController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  escalateSchema,
  extendDeadlineSchema,
  nudgeSchema,
  publishSchema,
} from '../schemas/reviewSchemas.js';

const router = Router();

router.use(requireAuth, requireRole('HR_ADMIN'));

router.get('/overview', getHrOverview);
router.post('/reviews/:reviewId/nudge', validateBody(nudgeSchema), nudgeReview);
router.post('/reviews/:reviewId/extend-deadline', validateBody(extendDeadlineSchema), extendReviewDeadline);
router.post('/reviews/:reviewId/escalate', validateBody(escalateSchema), escalateReview);
router.post('/cycles/:cycleId/publish', validateBody(publishSchema), publishCycleResults);
router.get('/audit-logs', listAuditLogs);

export default router;
