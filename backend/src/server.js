import { createApp } from './app.js';
import { env } from './config/env.js';
import { closeStore, initStore } from './services/storeService.js';

async function start() {
  await initStore();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(
      `[empeo-api] Listening on http://localhost:${env.PORT} (mode: ${env.storageMode})`
    );
  });

  async function shutdown(signal) {
    console.log(`[empeo-api] Received ${signal}, flushing pending database writes...`);
    server.close(async () => {
      await closeStore();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('[empeo-api] Failed to start server:', err);
  process.exit(1);
});
