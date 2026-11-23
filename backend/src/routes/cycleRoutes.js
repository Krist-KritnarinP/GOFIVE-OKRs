import { Router } from 'express';
import { getActiveCycle, patchCycle } from '../controllers/cycleController.js';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { updateCycleSchema } from '../schemas/reviewSchemas.js';

const router = Router();

router.get('/active', requireAuth, getActiveCycle);
router.patch('/:cycleId', requireAuth, requirePermission('cycle:configure'), validateBody(updateCycleSchema), patchCycle);

export default router;
