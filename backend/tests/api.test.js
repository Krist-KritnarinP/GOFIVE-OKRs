import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { resetStore } from '../src/services/storeService.js';

async function withServer(fn) {
  resetStore();
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api/v1`;

  async function req(path, { method = 'GET', token, body } = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json();
    return { status: res.status, json, headers: res.headers };
  }

  async function tokenFor(userId) {
    const res = await req('/auth/demo-switch', { method: 'POST', body: { userId } });
    assert.equal(res.status, 200);
    return res.json.data.token;
  }

  try {
    await fn({ req, tokenFor });
  } finally {
    server.close();
  }
}

test('RBAC: Employee cannot access HR overview and Manager cannot read another team review', async () => {
  await withServer(async ({ req, tokenFor }) => {
    const empToken = await tokenFor('usr-emp-nida');
    const hrRes = await req('/hr/overview', { token: empToken });
    assert.equal(hrRes.status, 403);
    assert.equal(hrRes.json.error.code, 'FORBIDDEN');

    const engMgrToken = await tokenFor('usr-mgr-eng');
    const salesReviewRes = await req('/reviews/rev-may', { token: engMgrToken });
    assert.equal(salesReviewRes.status, 403);
    assert.equal(salesReviewRes.json.error.code, 'FORBIDDEN');
  });
});

test('Security Gate: Employee cannot see manager scores before HR publishes results', async () => {
  await withServer(async ({ req, tokenFor }) => {
    // Fah is READY_FOR_RELEASE (not published yet)
    const fahToken = await tokenFor('usr-emp-fah');
    const beforeRes = await req('/reviews/me', { token: fahToken });
    assert.equal(beforeRes.status, 200);
    assert.equal(beforeRes.json.data.review.resultsLocked, true);
    assert.equal(beforeRes.json.data.review.overallScore, null);
    assert.equal(beforeRes.json.data.review.managerPayload, null);

    // HR publishes Fah's review
    const hrToken = await tokenFor('usr-hr');
    const pubRes = await req('/hr/cycles/cycle-fy2026/publish', {
      method: 'POST',
      token: hrToken,
      body: { reviewIds: ['rev-fah'] },
    });
    assert.equal(pubRes.status, 200);
    assert.equal(pubRes.json.data.publishedCount, 1);

    // Now Fah sees full scores and 9-box placement
    const afterRes = await req('/reviews/me', { token: fahToken });
    assert.equal(afterRes.status, 200);
    assert.equal(afterRes.json.data.review.resultsLocked, false);
    assert.equal(typeof afterRes.json.data.review.overallScore, 'number');
    assert.ok(afterRes.json.data.review.nineBoxCell);
  });
});

test('Fairness Guardrail: Manager rating of 5 or 1 without >= 20 char evidence returns 400', async () => {
  await withServer(async ({ req, tokenFor }) => {
    const mgrToken = await tokenFor('usr-mgr-eng');
    const badRes = await req('/reviews/rev-ton/manager-review', {
      method: 'PUT',
      token: mgrToken,
      body: {
        goalRatings: [
          { goalId: 'g-ton-1', score: 5, evidence: 'Too short' },
          { goalId: 'g-ton-2', score: 3, evidence: '' },
        ],
        competencyRatings: [
          { competencyId: 'comp-ownership', score: 3, evidence: '' },
          { competencyId: 'comp-collab', score: 3, evidence: '' },
          { competencyId: 'comp-problem', score: 3, evidence: '' },
        ],
        managerSummary: 'Good work',
        developmentFocus: 'Keep growing',
        submit: true,
      },
    });
    assert.equal(badRes.status, 400);
    assert.equal(badRes.json.error.code, 'VALIDATION_ERROR');

    // Now submit with proper >= 20 char evidence
    const okRes = await req('/reviews/rev-ton/manager-review', {
      method: 'PUT',
      token: mgrToken,
      body: {
        goalRatings: [
          { goalId: 'g-ton-1', score: 5, evidence: 'Delivered full responsive ESS mobile screens with Lighthouse score 97 across devices.' },
          { goalId: 'g-ton-2', score: 4, evidence: 'Cut UI regressions steadily across Q3 and Q4.' },
        ],
        competencyRatings: [
          { competencyId: 'comp-ownership', score: 4, evidence: '' },
          { competencyId: 'comp-collab', score: 4, evidence: '' },
          { competencyId: 'comp-problem', score: 4, evidence: '' },
        ],
        managerSummary: 'Strong frontend ownership and quality improvements.',
        developmentFocus: 'Lead automated E2E accessibility checks.',
        submit: true,
      },
    });
    assert.equal(okRes.status, 200);
    assert.equal(okRes.json.data.review.status, 'READY_FOR_RELEASE');
    assert.ok(okRes.json.data.review.nineBoxCell);
  });
});

test('HR Oversight: Bias Alert detects lenient Sales manager and Exception actions log to AuditLog', async () => {
  await withServer(async ({ req, tokenFor }) => {
    const hrToken = await tokenFor('usr-hr');
    const overview = await req('/hr/overview', { token: hrToken });
    assert.equal(overview.status, 200);
    assert.ok(overview.json.data.biasAlerts.length >= 1);
    assert.equal(overview.json.data.biasAlerts[0].flagType, 'LENIENCY_BIAS');
    assert.ok(overview.json.data.exceptions.length >= 2);

    // Nudge + Extend + Escalate + Lock Cycle
    const nudgeRes = await req('/hr/reviews/rev-ton/nudge', {
      method: 'POST',
      token: hrToken,
      body: { message: 'Please submit Ton evaluation by EOD.' },
    });
    assert.equal(nudgeRes.status, 200);

    const extRes = await req('/hr/reviews/rev-bank/extend-deadline', {
      method: 'POST',
      token: hrToken,
      body: { extraDays: 5, reason: 'Employee on approved medical leave.' },
    });
    assert.equal(extRes.status, 200);

    const escRes = await req('/hr/reviews/rev-ton/escalate', {
      method: 'POST',
      token: hrToken,
      body: { reason: 'Overdue > 48h without manager response.' },
    });
    assert.equal(escRes.status, 200);

    const lockRes = await req('/cycles/cycle-fy2026', {
      method: 'PATCH',
      token: hrToken,
      body: { isLocked: true, reason: 'Closing cycle for calibration review.' },
    });
    assert.equal(lockRes.status, 200);
    assert.equal(lockRes.json.data.cycle.isLocked, true);

    const logsRes = await req('/hr/audit-logs', { token: hrToken });
    assert.equal(logsRes.status, 200);
    assert.ok(logsRes.json.data.auditLogs.length >= 5);
  });
});
