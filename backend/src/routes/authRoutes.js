import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  demoSwitch,
  getMe,
  listDemoAccounts,
  login,
  register,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import {
  demoSwitchSchema,
  loginSchema,
  registerSchema,
} from '../schemas/reviewSchemas.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Try again later.' },
  },
});

router.get('/demo-accounts', listDemoAccounts);
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/demo-switch', authLimiter, validateBody(demoSwitchSchema), demoSwitch);
router.get('/me', requireAuth, getMe);

export default router;
