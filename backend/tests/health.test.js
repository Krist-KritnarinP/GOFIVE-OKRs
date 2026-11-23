import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('GET /api/v1/health returns healthy status and security headers', async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/v1/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.data.status, 'healthy');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-powered-by'), null);
  } finally {
    server.close();
  }
});
