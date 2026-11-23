import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(
    `[empeo-api] Listening on http://localhost:${env.PORT} (mode: ${env.storageMode})`
  );
});
