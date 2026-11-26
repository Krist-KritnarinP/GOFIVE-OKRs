import { Router } from 'express';
import { env } from '../config/env.js';

const router = Router();

router.get('/health', (_req, res) => {
  const isProd = env.NODE_ENV === 'production';
  res.json({
    ok: true,
    data: {
      service: 'empeo-performance-api',
      status: 'healthy',
      ...(isProd ? {} : { storageMode: env.storageMode }),
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
