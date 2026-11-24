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

test('Security Gate (Approach A): Employee cannot see manager scores in MANAGER_APPROVED until HR Approve & Publish', async () => {
  await withServer(async ({ req, tokenFor }) => {
    // Nut is MANAGER_APPROVED (hidden from employee until HR Approve & Publish)
    const nutToken = await tokenFor('usr-emp-nut');
    const beforeRes = await req('/reviews/me', { token: nutToken });
    assert.equal(beforeRes.status, 200);
    assert.equal(beforeRes.json.data.review.resultsLocked, true);
    assert.equal(beforeRes.json.data.review.overallScore, null);
    assert.equal(beforeRes.json.data.review.managerPayload, null);
    assert.equal(beforeRes.json.data.review.employee.jobLevel, 'L1_JUNIOR');

    // HR Approve & Publish directly releases Nut's review
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

test('OKR Co-Edit Weight/Multiplier + HRBP Advisor Comment on Ping-Pong >= 2 + 3-Stage Deadlines', async () => {
  await withServer(async ({ req, tokenFor }) => {
    const fahToken = await tokenFor('usr-emp-fah');
    const mgrToken = await tokenFor('usr-mgr-prod');
    const hrToken = await tokenFor('usr-hr');

    // 1. HRBP sees rev-fah flagged for PING_PONG_LIMIT (>= 2 rounds) and posts Advisor Comment
    const overview = await req('/hr/overview', { token: hrToken });
    const fahCard = overview.json.data.reviews.find((r) => r.id === 'rev-fah');
    assert.equal(fahCard.hrbpInterventionNeeded, true);
    assert.ok(fahCard.hrbpReasons.includes('PING_PONG_LIMIT'));

    const advRes = await req('/hr/reviews/rev-fah/advisor-comment', {
      method: 'POST',
      token: hrToken,
      body: { comment: 'Recommend a 15-min 1-on-1 alignment check-in to agree on measurable module criteria.' },
    });
    assert.equal(advRes.status, 200);
    assert.ok(advRes.json.data.review.commentHistory.some((c) => c.action === 'HRBP_ADVISOR_COMMENT'));

    // 2. Employee submits valid 100% OKRs
    const okGoals = await req('/reviews/rev-fah/goals', {
      method: 'PUT',
      token: fahToken,
      body: {
        goals: [
          { id: 'g-fah-1', title: 'Redesign Leave UX', metricType: 'QUALITATIVE', targetValue: '88', unit: 'SUS Score', weight: 50, multiplier: 1.1, dueDate: '2026-10-31' },
          { id: 'g-fah-2', title: 'Unify Tokens + WCAG Audit', metricType: 'QUANTITATIVE', targetValue: '4', unit: 'HR modules', weight: 50, multiplier: 1.0, dueDate: '2026-11-30' },
        ],
        comment: 'Aligned criteria after HRBP check-in.',
        submit: true,
      },
    });
    assert.equal(okGoals.status, 200);
    assert.equal(okGoals.json.data.review.status, 'GOAL_PENDING_APPROVAL');

    // 3. Manager co-edits Weight (60/40) & Multiplier (1.2x/1.0x) on Approve -> logs transparent diff!
    const approveGoals = await req('/reviews/rev-fah/goals/decision', {
      method: 'POST',
      token: mgrToken,
      body: {
        decision: 'APPROVE',
        comment: 'Approved with rebalanced L2 Mid OKR weighting.',
        adjustedGoals: [
          { id: 'g-fah-1', weight: 60, multiplier: 1.2 },
          { id: 'g-fah-2', weight: 40, multiplier: 1.0 },
        ],
      },
    });
    assert.equal(approveGoals.status, 200);
    assert.equal(approveGoals.json.data.review.status, 'GOAL_APPROVED');
    const updatedG1 = approveGoals.json.data.review.goals.find((g) => g.id === 'g-fah-1');
    assert.equal(updatedG1.weight, 60);
    assert.equal(updatedG1.multiplier, 1.2);
    const lastCmt = approveGoals.json.data.review.commentHistory.at(-1);
    assert.ok(lastCmt.comment.includes('Weight 50% -> 60%'));

    // 4. HR updates 3-Stage Due Dates
    const stageRes = await req('/cycles/cycle-fy2026', {
      method: 'PATCH',
      token: hrToken,
      body: {
        stage3HrAuditDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        reason: 'Extended Stage 3 HRBP Audit & Publish window by 3 days.',
      },
    });
    assert.equal(stageRes.status, 200);
    assert.ok(stageRes.json.data.cycle.stage3HrAuditDeadline);
  });
});

test('Activity Log Strict RBAC Privacy Isolation across ALL 4 Roles', async () => {
  await withServer(async ({ req, tokenFor }) => {
    const superToken = await tokenFor('usr-super');
    const hrToken = await tokenFor('usr-hr');
    const engMgrToken = await tokenFor('usr-mgr-eng');
    const nidaToken = await tokenFor('usr-emp-nida');
    const nutToken = await tokenFor('usr-emp-nut');

    const superLogs = (await req('/activity-logs', { token: superToken })).json.data.activityLogs;
    const hrLogs = (await req('/activity-logs', { token: hrToken })).json.data.activityLogs;
    const engMgrLogs = (await req('/activity-logs', { token: engMgrToken })).json.data.activityLogs;
    const nidaLogs = (await req('/activity-logs', { token: nidaToken })).json.data.activityLogs;
    const nutLogs = (await req('/activity-logs', { token: nutToken })).json.data.activityLogs;

    // 1. Super Admin sees ADMIN_SECURITY & CYCLE_GOVERNANCE only
    assert.ok(superLogs.some((l) => l.visibilityScope === 'ADMIN_SECURITY'));
    assert.ok(superLogs.every((l) => ['ADMIN_SECURITY', 'CYCLE_GOVERNANCE'].includes(l.visibilityScope)));

    // 2. HR Admin sees org operational logs including HR_INTERNAL bias alerts, NEVER ADMIN_SECURITY
    assert.ok(hrLogs.some((l) => l.visibilityScope === 'HR_INTERNAL'));
    assert.ok(hrLogs.every((l) => l.visibilityScope !== 'ADMIN_SECURITY'));

    // 3. Engineering Manager (Sarah) sees ONLY own team's TEAM_MANAGER / PUBLIC_SELF logs
    assert.ok(engMgrLogs.length >= 2);
    assert.ok(engMgrLogs.every((l) => ['TEAM_MANAGER', 'PUBLIC_SELF'].includes(l.visibilityScope)));
    assert.ok(engMgrLogs.every((l) => l.targetManagerId === 'usr-mgr-eng' || l.actorId === 'usr-mgr-eng'));
    assert.ok(engMgrLogs.every((l) => l.action !== 'BIAS_ALERT_FLAGGED'));

    // 4. Employee (Nida) sees ONLY own PUBLIC_SELF events
    assert.ok(nidaLogs.length >= 1);
    assert.ok(nidaLogs.every((l) => l.visibilityScope === 'PUBLIC_SELF' && l.targetEmployeeId === 'usr-emp-nida'));

    // 5. Unpublished Employee (Nut) MUST NOT see Kanya's TEAM_MANAGER score log or HR bias alerts!
    assert.ok(nutLogs.every((l) => l.visibilityScope === 'PUBLIC_SELF' && l.targetEmployeeId === 'usr-emp-nut'));
    assert.ok(!nutLogs.some((l) => l.action === 'MANAGER_APPROVED'));
    assert.ok(!nutLogs.some((l) => l.visibilityScope === 'HR_INTERNAL'));
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
      body: { isLocked: true, reason: 'Closing cycle for final HR review.' },
    });
    assert.equal(lockRes.status, 200);
    assert.equal(lockRes.json.data.cycle.isLocked, true);

    const logsRes = await req('/hr/audit-logs', { token: hrToken });
    assert.equal(logsRes.status, 200);
    assert.ok(logsRes.json.data.auditLogs.length >= 5);
  });
});

test('Auth & Super Admin Dynamic RBAC: Register -> Pending -> Approve with JobLevel -> Login + Live Permission Toggle', async () => {
  await withServer(async ({ req }) => {
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

    const blockedLogin = await req('/auth/login', {
      method: 'POST',
      body: { employeeCode: 'EMP-4001', password: 'NewUserPass123!' },
    });
    assert.equal(blockedLogin.status, 403);
    assert.equal(blockedLogin.json.error.code, 'ACCOUNT_PENDING');

    const superLogin = await req('/auth/login', {
      method: 'POST',
      body: { employeeCode: 'EMP-0001', password: 'DemoPass123!' },
    });
    assert.equal(superLogin.status, 200);
    const superToken = superLogin.json.data.token;

    const approveRes = await req(`/admin/users/${newUserId}`, {
      method: 'PATCH',
      token: superToken,
      body: { accountStatus: 'ACTIVE', role: 'EMPLOYEE', jobLevel: 'L3_SENIOR' },
    });
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.json.data.user.accountStatus, 'ACTIVE');
    assert.equal(approveRes.json.data.user.jobLevel, 'L3_SENIOR');

    const okLogin = await req('/auth/login', {
      method: 'POST',
      body: { employeeCode: 'EMP-4001', password: 'NewUserPass123!' },
    });
    assert.equal(okLogin.status, 200);
    assert.equal(okLogin.json.data.user.employeeCode, 'EMP-4001');

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

test('State Guards & Dept Manager Mapping: Published reviews reject mutations with 409 and Sales register maps to Sales Manager', async () => {
  await withServer(async ({ req, tokenFor }) => {
    const mgrToken = await tokenFor('usr-mgr-eng');
    const hrToken = await tokenFor('usr-hr');

    // rev-nida is PUBLISHED — all 3 return/decision endpoints must reject with 409 CONFLICT
    const goalDec = await req('/reviews/rev-nida/goals/decision', {
      method: 'POST',
      token: mgrToken,
      body: { decision: 'REQUEST_REVISION', comment: 'Trying to reopen published goals.' },
    });
    assert.equal(goalDec.status, 409);
    assert.equal(goalDec.json.error.code, 'CONFLICT');

    const retEmp = await req('/reviews/rev-nida/return-to-employee', {
      method: 'POST',
      token: mgrToken,
      body: { comment: 'Trying to return published self-review.' },
    });
    assert.equal(retEmp.status, 409);
    assert.equal(retEmp.json.error.code, 'CONFLICT');

    const retMgr = await req('/hr/reviews/rev-nida/return-to-manager', {
      method: 'POST',
      token: hrToken,
      body: { comment: 'Trying to return published review to manager.' },
    });
    assert.equal(retMgr.status, 409);
    assert.equal(retMgr.json.error.code, 'CONFLICT');

    // Registering a Sales employee assigns Sales Manager (usr-mgr-sales)
    const regSales = await req('/auth/register', {
      method: 'POST',
      body: {
        employeeCode: 'EMP-4099',
        name: 'Suda Sales',
        department: 'Sales',
        title: 'Account Executive',
        password: 'SalesUserPass123!',
      },
    });
    assert.equal(regSales.status, 201);
    assert.equal(regSales.json.data.user.managerId, 'usr-mgr-sales');
  });
});
