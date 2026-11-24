import { Router } from 'express';
import { listMyActivityLogs } from '../controllers/hrController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, listMyActivityLogs);

export default router;
