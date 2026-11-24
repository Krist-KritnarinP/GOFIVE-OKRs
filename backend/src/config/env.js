import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('dev-only-change-this-secret-before-production'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

if (data.NODE_ENV === 'production' && data.JWT_SECRET.startsWith('dev-only-')) {
  console.error('Refusing to start in production with a default JWT_SECRET.');
  process.exit(1);
}

export const env = {
  ...data,
  corsOriginList: data.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  storageMode:
    data.NODE_ENV === 'test' || !data.DATABASE_URL ? 'memory-fallback' : 'prisma',
};
