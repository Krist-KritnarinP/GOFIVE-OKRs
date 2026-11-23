import { Router } from 'express';
import { env } from '../config/env.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    data: {
      service: 'empeo-performance-api',
      status: 'healthy',
      storageMode: env.storageMode,
      phase: 'phase-0-ready',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
