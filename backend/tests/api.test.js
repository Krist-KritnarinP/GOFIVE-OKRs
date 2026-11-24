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

test('Security Gate: Employee cannot see manager scores even in CALIBRATION_LOCKED until PUBLISHED', async () => {
  await withServer(async ({ req, tokenFor }) => {
    // Nut is CALIBRATION_LOCKED (not published yet)
    const nutToken = await tokenFor('usr-emp-nut');
    const beforeRes = await req('/reviews/me', { token: nutToken });
    assert.equal(beforeRes.status, 200);
    assert.equal(beforeRes.json.data.review.resultsLocked, true);
    assert.equal(beforeRes.json.data.review.overallScore, null);
    assert.equal(beforeRes.json.data.review.managerPayload, null);

    // HR publishes Nut's calibrated review
    const hrToken = await tokenFor('usr-hr');
    const pubRes = await req('/hr/cycles/cycle-fy2026/publish', {
      method: 'POST',
      token: hrToken,
      body: { reviewIds: ['rev-nut'] },
    });
    assert.equal(pubRes.status, 200);
    assert.equal(pubRes.json.data.publishedCount, 1);

    // Now Nut sees full scores and 9-box placement
    const afterRes = await req('/reviews/me', { token: nutToken });
    assert.equal(afterRes.status, 200);
    assert.equal(afterRes.json.data.review.resultsLocked, false);
    assert.equal(typeof afterRes.json.data.review.overallScore, 'number');
    assert.ok(afterRes.json.data.review.nineBoxCell);
  });
});

test('Full Goal Setting Ping-Pong (Weight=100% + Revision History) & Calibration Lock Flow', async () => {
  await withServer(async ({ req, tokenFor }) => {
    const fahToken = await tokenFor('usr-emp-fah');
    const mgrToken = await tokenFor('usr-mgr-prod');
    const hrToken = await tokenFor('usr-hr');

    // 1. Submitting goals with total weight !== 100 returns 400
    const badWeight = await req('/reviews/rev-fah/goals', {
      method: 'PUT',
      token: fahToken,
      body: {
        goals: [
          { title: 'Goal A', metricType: 'QUANTITATIVE', targetValue: '88', unit: 'SUS', weight: 60, multiplier: 1.1, dueDate: '2026-10-31' },
        ],
        submit: true,
      },
    });
    assert.equal(badWeight.status, 400);

    // 2. Employee submits valid 100% goals (Ping-Pong Round 2)
    const okGoals = await req('/reviews/rev-fah/goals', {
      method: 'PUT',
      token: fahToken,
      body: {
        goals: [
          { title: 'Redesign Leave UX', metricType: 'QUALITATIVE', targetValue: '88', unit: 'SUS Score', weight: 50, multiplier: 1.1, dueDate: '2026-10-31' },
          { title: 'Unify Tokens + WCAG Audit', metricType: 'QUANTITATIVE', targetValue: '100', unit: '% pass', weight: 50, multiplier: 1.0, dueDate: '2026-11-30' },
        ],
        comment: 'Updated targets per Round 1 feedback.',
        submit: true,
      },
    });
    assert.equal(okGoals.status, 200);
    assert.equal(okGoals.json.data.review.status, 'GOAL_PENDING_APPROVAL');
    assert.ok(okGoals.json.data.review.commentHistory.length >= 3);

    // 3. Manager approves goals
    const approveGoals = await req('/reviews/rev-fah/goals/decision', {
      method: 'POST',
      token: mgrToken,
      body: { decision: 'APPROVE', comment: 'Aligned and ambitious. Approved!' },
    });
    assert.equal(approveGoals.status, 200);
    assert.equal(approveGoals.json.data.review.status, 'GOAL_APPROVED');

    // 4. HR locks calibration for MANAGER_APPROVED reviews (rev-may, rev-art)
    const calRes = await req('/hr/cycles/cycle-fy2026/calibrate', {
      method: 'POST',
      token: hrToken,
      body: { reviewIds: ['rev-may'], note: 'Verified enterprise revenue numbers.' },
    });
    assert.equal(calRes.status, 200);
    assert.equal(calRes.json.data.calibratedCount, 1);
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
    assert.equal(okRes.json.data.review.status, 'MANAGER_APPROVED');
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
    assert.ok(overview.json.data.exceptions.length >= 1);

    // Nudge + Extend + Escalate + Lock Cycle
    const nudgeRes = await req('/hr/reviews/rev-ton/nudge', {
      method: 'POST',
      token: hrToken,
      body: { message: 'Please submit Ton evaluation by EOD.' },
    });
    assert.equal(nudgeRes.status, 200);

    const extRes = await req('/hr/reviews/rev-ton/extend-deadline', {
      method: 'POST',
      token: hrToken,
      body: { extraDays: 5, reason: 'Manager on approved business travel.' },
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

test('Auth & Super Admin Dynamic RBAC: Register -> Pending -> Approve -> Login + Live Permission Toggle', async () => {
  await withServer(async ({ req }) => {
    // 1. Register new employee with Employee Code
    const regRes = await req('/auth/register', {
      method: 'POST',
      body: {
        employeeCode: 'EMP-4001',
        name: 'Korn Supakit',
        department: 'Engineering',
        title: 'Software Engineer',
        password: 'NewUserPass123!',
      },
    });
    assert.equal(regRes.status, 201);
    assert.equal(regRes.json.data.user.accountStatus, 'PENDING_APPROVAL');
    const newUserId = regRes.json.data.user.id;

    // 2. Pending account cannot log in yet
    const blockedLogin = await req('/auth/login', {
      method: 'POST',
      body: { employeeCode: 'EMP-4001', password: 'NewUserPass123!' },
    });
    assert.equal(blockedLogin.status, 403);
    assert.equal(blockedLogin.json.error.code, 'ACCOUNT_PENDING');

    // 3. Super Admin logs in with Employee Code + Password and approves account
    const superLogin = await req('/auth/login', {
      method: 'POST',
      body: { employeeCode: 'EMP-0001', password: 'DemoPass123!' },
    });
    assert.equal(superLogin.status, 200);
    const superToken = superLogin.json.data.token;

    const approveRes = await req(`/admin/users/${newUserId}`, {
      method: 'PATCH',
      token: superToken,
      body: { accountStatus: 'ACTIVE', role: 'EMPLOYEE' },
    });
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.json.data.user.accountStatus, 'ACTIVE');

    // 4. Now EMP-4001 can log in
    const okLogin = await req('/auth/login', {
      method: 'POST',
      body: { employeeCode: 'EMP-4001', password: 'NewUserPass123!' },
    });
    assert.equal(okLogin.status, 200);
    assert.equal(okLogin.json.data.user.employeeCode, 'EMP-4001');

    // 5. Super Admin revokes review:publish from HR_ADMIN -> HR gets 403 immediately
    const hrLogin = await req('/auth/login', {
      method: 'POST',
      body: { employeeCode: 'EMP-1001', password: 'DemoPass123!' },
    });
    const hrToken = hrLogin.json.data.token;

    const revokeRes = await req('/admin/permissions', {
      method: 'PUT',
      token: superToken,
      body: { role: 'HR_ADMIN', permissionKey: 'review:publish', allowed: false },
    });
    assert.equal(revokeRes.status, 200);

    const deniedPublish = await req('/hr/cycles/cycle-fy2026/publish', {
      method: 'POST',
      token: hrToken,
      body: {},
    });
    assert.equal(deniedPublish.status, 403);
    assert.equal(deniedPublish.json.error.code, 'FORBIDDEN');
  });
});
