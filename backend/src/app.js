import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cycleRoutes from './routes/cycleRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.corsOriginList.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again shortly.',
        },
      },
    })
  );

  app.use(express.json({ limit: '1mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use('/api/v1', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/cycles', cycleRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/hr', hrRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/activity-logs', activityRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
