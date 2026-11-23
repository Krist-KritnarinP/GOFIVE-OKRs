import { Router } from 'express';
import {
  escalateReview,
  extendReviewDeadline,
  getHrOverview,
  listAuditLogs,
  nudgeReview,
  publishCycleResults,
} from '../controllers/hrController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  escalateSchema,
  extendDeadlineSchema,
  nudgeSchema,
  publishSchema,
} from '../schemas/reviewSchemas.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', requirePermission('analytics:view_org'), getHrOverview);
router.post('/reviews/:reviewId/nudge', requirePermission('exception:manage'), validateBody(nudgeSchema), nudgeReview);
router.post('/reviews/:reviewId/extend-deadline', requirePermission('exception:manage'), validateBody(extendDeadlineSchema), extendReviewDeadline);
router.post('/reviews/:reviewId/escalate', requirePermission('exception:manage'), validateBody(escalateSchema), escalateReview);
router.post('/cycles/:cycleId/publish', requirePermission('review:publish'), validateBody(publishSchema), publishCycleResults);
router.get('/audit-logs', requirePermission('audit:view'), listAuditLogs);

export default router;
