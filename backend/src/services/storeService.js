import crypto from 'node:crypto';
import {
  COMPETENCIES,
  DEFAULT_ROLE_PERMISSIONS,
  RUBRIC_LEVELS,
  createInitialSeed,
} from '../data/seedData.js';
import { env } from '../config/env.js';
import { disconnectPrisma, getPrismaClient } from './prismaClient.js';

let state = createInitialSeed();
let writeQueue = Promise.resolve();

function toIso(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toDateOnly(value) {
  if (!value) return null;
  const iso = toIso(value);
  return iso ? iso.slice(0, 10) : null;
}

function toDateOrNull(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return value instanceof Date ? value : new Date(value);
}

function enqueuePersist(label, operation) {
  if (env.storageMode !== 'prisma') return;
  const prisma = getPrismaClient();
  if (!prisma) return;

  writeQueue = writeQueue
    .then(() => operation(prisma))
    .catch((err) => {
      console.error(`[storeService] Failed to persist ${label} to Supabase:`, err?.message || err);
    });
}

export async function flushStore() {
  await writeQueue;
}

export async function closeStore() {
  await flushStore();
  await disconnectPrisma();
}

function hydrateCycle(row) {
  const rubricConfig = row.rubricConfig && typeof row.rubricConfig === 'object' ? row.rubricConfig : {};
  return {
    id: row.id,
    name: row.name,
    nameTh: row.nameTh || row.name,
    period: row.period,
    whatWeight: row.whatWeight,
    howWeight: row.howWeight,
    stage1DraftDeadline: toIso(row.stage1DraftDeadline),
    stage2ApprovalDeadline: toIso(row.stage2ApprovalDeadline),
    stage3HrAuditDeadline: toIso(row.stage3HrAuditDeadline),
    selfDeadline: toIso(row.selfDeadline),
    managerDeadline: toIso(row.managerDeadline),
    isGracePeriodActive: row.isGracePeriodActive,
    isLocked: row.isLocked,
    isActive: row.isActive,
    rubricLevels: Array.isArray(rubricConfig.rubricLevels) ? rubricConfig.rubricLevels : RUBRIC_LEVELS,
    competencies: Array.isArray(rubricConfig.competencies) ? rubricConfig.competencies : COMPETENCIES,
  };
}

function hydrateGoal(row) {
  return {
    id: row.id,
    cycleId: row.cycleId,
    employeeId: row.employeeId,
    title: row.title,
    titleTh: row.titleTh,
    metricType: row.metricType,
    targetValue: row.targetValue,
    unit: row.unit,
    metric: row.metric,
    weight: row.weight,
    multiplier: row.multiplier,
    dueDate: toDateOnly(row.dueDate) || '2026-10-31',
    actualValue: row.actualValue ?? '',
    progressPct: row.progressPct ?? 0,
  };
}

function hydrateReview(row) {
  return {
    id: row.id,
    cycleId: row.cycleId,
    employeeId: row.employeeId,
    managerId: row.managerId,
    status: row.status,
    revisionRound: row.revisionRound ?? 1,
    selfPayload: row.selfPayload ?? null,
    managerPayload: row.managerPayload ?? null,
    commentHistory: Array.isArray(row.commentHistory) ? row.commentHistory : [],
    whatPct: row.whatPct ?? null,
    whatScore: row.whatScore ?? null,
    howScore: row.howScore ?? null,
    overallScore: row.overallScore ?? null,
    nineBoxCell: row.nineBoxCell ?? null,
    goalsSubmittedAt: toIso(row.goalsSubmittedAt),
    goalsApprovedAt: toIso(row.goalsApprovedAt),
    selfSubmittedAt: toIso(row.selfSubmittedAt),
    managerSubmittedAt: toIso(row.managerSubmittedAt),
    extendedDeadline: toIso(row.extendedDeadline),
    escalatedToSkipLevel: Boolean(row.escalatedToSkipLevel),
    lastNudgedAt: toIso(row.lastNudgedAt),
    publishedAt: toIso(row.publishedAt),
  };
}

function hydrateAuditLog(row) {
  return {
    id: row.id,
    cycleId: row.cycleId ?? null,
    reviewId: row.reviewId ?? null,
    actorId: row.actorId,
    actorName: row.actor?.name || 'System',
    actorRole: row.actor?.role || 'SYSTEM',
    action: row.action,
    visibilityScope: row.visibilityScope,
    targetEmployeeId: row.targetEmployeeId ?? null,
    targetManagerId: row.targetManagerId ?? null,
    reason: row.reason ?? null,
    metadata: row.metadata ?? null,
    createdAt: toIso(row.createdAt),
  };
}

export async function initStore() {
  if (env.storageMode !== 'prisma') {
    return { mode: 'memory-fallback' };
  }

  const prisma = getPrismaClient();
  const [cycles, users, rolePerms, goals, reviews, auditLogs] = await Promise.all([
    prisma.reviewCycle.findMany({ orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }] }),
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.rolePermission.findMany(),
    prisma.goal.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.review.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (cycles.length === 0 || users.length === 0) {
    console.warn(
      '[storeService] Supabase tables are empty. Run "npm --prefix backend run prisma:seed" to seed initial data.'
    );
    return { mode: 'prisma', hydrated: false };
  }

  const rolePermissions = structuredClone(DEFAULT_ROLE_PERMISSIONS);
  for (const row of rolePerms) {
    if (!rolePermissions[row.role]) {
      rolePermissions[row.role] = {};
    }
    rolePermissions[row.role][row.permissionKey] = Boolean(row.allowed);
  }

  state = {
    cycle: hydrateCycle(cycles[0]),
    users: users.map((u) => ({
      id: u.id,
      employeeCode: u.employeeCode,
      email: u.email,
      passwordHash: u.passwordHash,
      name: u.name,
      nameTh: u.nameTh || u.name,
      title: u.title,
      department: u.department,
      jobLevel: u.jobLevel,
      role: u.role,
      accountStatus: u.accountStatus,
      managerId: u.managerId ?? null,
    })),
    rolePermissions,
    goals: goals.map(hydrateGoal),
    reviews: reviews.map(hydrateReview),
    auditLogs: auditLogs.map(hydrateAuditLog),
  };

  console.log(
    `[storeService] Hydrated from Supabase: ${state.users.length} users, ${state.goals.length} goals, ${state.reviews.length} reviews, ${state.auditLogs.length} audit logs.`
  );

  return {
    mode: 'prisma',
    hydrated: true,
    counts: {
      users: state.users.length,
      goals: state.goals.length,
      reviews: state.reviews.length,
      auditLogs: state.auditLogs.length,
    },
  };
}

export function resetStore() {
  state = createInitialSeed();
}

export function getCycle() {
  return state.cycle;
}

export function updateCycle(patch) {
  state.cycle = { ...state.cycle, ...patch };
  const cycleId = state.cycle.id;

  const data = {};
  const scalarFields = ['name', 'nameTh', 'period', 'whatWeight', 'howWeight', 'isGracePeriodActive', 'isLocked', 'isActive'];
  for (const key of scalarFields) {
    if (patch[key] !== undefined) data[key] = patch[key];
  }
  const dateFields = ['stage1DraftDeadline', 'stage2ApprovalDeadline', 'stage3HrAuditDeadline', 'selfDeadline', 'managerDeadline'];
  for (const key of dateFields) {
    if (patch[key] !== undefined) data[key] = new Date(patch[key]);
  }
  if (patch.rubricLevels !== undefined || patch.competencies !== undefined) {
    data.rubricConfig = {
      rubricLevels: state.cycle.rubricLevels,
      competencies: state.cycle.competencies,
    };
  }

  if (Object.keys(data).length > 0) {
    enqueuePersist(`updateCycle(${cycleId})`, (prisma) =>
      prisma.reviewCycle.update({ where: { id: cycleId }, data })
    );
  }

  return state.cycle;
}

export function getUsers() {
  return state.users;
}

export function getUserById(userId) {
  return state.users.find((u) => u.id === userId) || null;
}

export function getUserByEmployeeCode(employeeCode) {
  const code = String(employeeCode || '').trim().toUpperCase();
  return state.users.find((u) => u.employeeCode.toUpperCase() === code) || null;
}

export function createUser(userInput) {
  const newUser = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    jobLevel: 'L2_MID',
    managerId: null,
    ...userInput,
  };
  state.users.push(newUser);

  enqueuePersist(`createUser(${newUser.id})`, (prisma) =>
    prisma.user.create({
      data: {
        id: newUser.id,
        employeeCode: newUser.employeeCode,
        email: newUser.email,
        passwordHash: newUser.passwordHash,
        name: newUser.name,
        nameTh: newUser.nameTh || newUser.name,
        title: newUser.title,
        department: newUser.department,
        jobLevel: newUser.jobLevel || 'L2_MID',
        role: newUser.role || 'EMPLOYEE',
        accountStatus: newUser.accountStatus || 'PENDING_APPROVAL',
        managerId: newUser.managerId ?? null,
      },
    })
  );

  return newUser;
}

export function updateUser(userId, patch) {
  const idx = state.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  state.users[idx] = { ...state.users[idx], ...patch };

  const allowedKeys = [
    'employeeCode',
    'email',
    'passwordHash',
    'name',
    'nameTh',
    'title',
    'department',
    'jobLevel',
    'role',
    'accountStatus',
    'managerId',
  ];
  const data = {};
  for (const key of allowedKeys) {
    if (patch[key] !== undefined) data[key] = patch[key];
  }

  if (Object.keys(data).length > 0) {
    enqueuePersist(`updateUser(${userId})`, (prisma) =>
      prisma.user.update({ where: { id: userId }, data })
    );
  }

  return state.users[idx];
}

export function getUsersMap() {
  return new Map(state.users.map((u) => [u.id, u]));
}

export function getRolePermissions() {
  return state.rolePermissions;
}

export function getPermissionsForRole(role) {
  return state.rolePermissions[role] || {};
}

export function hasPermission(role, permissionKey) {
  return Boolean(state.rolePermissions[role]?.[permissionKey]);
}

export function setRolePermission(role, permissionKey, allowed) {
  if (!state.rolePermissions[role]) {
    state.rolePermissions[role] = {};
  }
  const finalAllowed =
    role === 'SUPER_ADMIN' && permissionKey === 'rbac:manage' ? true : Boolean(allowed);
  state.rolePermissions[role][permissionKey] = finalAllowed;

  enqueuePersist(`setRolePermission(${role}, ${permissionKey})`, (prisma) =>
    prisma.rolePermission.upsert({
      where: { role_permissionKey: { role, permissionKey } },
      update: { allowed: finalAllowed },
      create: { role, permissionKey, allowed: finalAllowed },
    })
  );

  return state.rolePermissions;
}

export function getGoalsByEmployee(employeeId) {
  return state.goals.filter((g) => g.employeeId === employeeId);
}

export function replaceGoalsForEmployee(employeeId, cycleId, nextGoals) {
  state.goals = state.goals.filter((g) => g.employeeId !== employeeId);
  const created = nextGoals.map((g, idx) => ({
    id: g.id || `g-${employeeId}-${idx + 1}-${crypto.randomUUID().slice(0, 4)}`,
    cycleId,
    employeeId,
    title: g.title,
    titleTh: g.titleTh || g.title,
    metricType: g.metricType || 'QUANTITATIVE',
    targetValue: g.targetValue || '100',
    unit: g.unit || '%',
    metric: `${g.targetValue || '100'} ${g.unit || '%'}`,
    weight: Number(g.weight),
    multiplier: Number(g.multiplier || 1.0),
    dueDate: g.dueDate || '2026-10-31',
    actualValue: g.actualValue || '',
    progressPct: Number(g.progressPct || 0),
  }));
  state.goals.push(...created);

  enqueuePersist(`replaceGoalsForEmployee(${employeeId})`, (prisma) => {
    const ops = [prisma.goal.deleteMany({ where: { employeeId, cycleId } })];
    if (created.length > 0) {
      ops.push(
        prisma.goal.createMany({
          data: created.map((g) => ({
            id: g.id,
            cycleId: g.cycleId,
            employeeId: g.employeeId,
            title: g.title,
            titleTh: g.titleTh,
            metricType: g.metricType,
            targetValue: g.targetValue,
            unit: g.unit,
            metric: g.metric,
            weight: g.weight,
            multiplier: g.multiplier,
            dueDate: toDateOrNull(g.dueDate),
            actualValue: g.actualValue,
            progressPct: g.progressPct,
          })),
        })
      );
    }
    return prisma.$transaction(ops);
  });

  return created;
}

export function appendReviewComment(reviewId, entry) {
  const rev = getReviewById(reviewId);
  if (!rev) return null;
  const history = Array.isArray(rev.commentHistory) ? rev.commentHistory : [];
  const nextEntry = {
    id: `cmt-${crypto.randomUUID().slice(0, 8)}`,
    round: rev.revisionRound || 1,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  return updateReview(reviewId, { commentHistory: [...history, nextEntry] });
}

export function getAllReviews() {
  return state.reviews;
}

export function getReviewById(reviewId) {
  return state.reviews.find((r) => r.id === reviewId) || null;
}

export function getReviewByEmployee(employeeId) {
  return state.reviews.find((r) => r.employeeId === employeeId) || null;
}

export function getTeamReviews(managerId) {
  return state.reviews.filter((r) => r.managerId === managerId);
}

export function updateReview(reviewId, patch) {
  const index = state.reviews.findIndex((r) => r.id === reviewId);
  if (index === -1) return null;
  state.reviews[index] = { ...state.reviews[index], ...patch };

  const scalarKeys = [
    'managerId',
    'status',
    'revisionRound',
    'selfPayload',
    'managerPayload',
    'commentHistory',
    'whatPct',
    'whatScore',
    'howScore',
    'overallScore',
    'nineBoxCell',
    'escalatedToSkipLevel',
  ];
  const dateKeys = [
    'goalsSubmittedAt',
    'goalsApprovedAt',
    'selfSubmittedAt',
    'managerSubmittedAt',
    'extendedDeadline',
    'lastNudgedAt',
    'publishedAt',
  ];

  const data = {};
  for (const key of scalarKeys) {
    if (patch[key] !== undefined) data[key] = patch[key];
  }
  for (const key of dateKeys) {
    if (patch[key] !== undefined) data[key] = toDateOrNull(patch[key]);
  }

  if (Object.keys(data).length > 0) {
    enqueuePersist(`updateReview(${reviewId})`, (prisma) =>
      prisma.review.update({ where: { id: reviewId }, data })
    );
  }

  return state.reviews[index];
}

export function appendAuditLog({
  cycleId = null,
  reviewId = null,
  actor,
  action,
  visibilityScope = 'HR_INTERNAL',
  targetEmployeeId = null,
  targetManagerId = null,
  reason = null,
  metadata = null,
}) {
  const entry = {
    id: `aud-${crypto.randomUUID().slice(0, 8)}`,
    cycleId,
    reviewId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role || 'SYSTEM',
    action,
    visibilityScope,
    targetEmployeeId,
    targetManagerId,
    reason,
    metadata,
    createdAt: new Date().toISOString(),
  };
  state.auditLogs.unshift(entry);

  enqueuePersist(`appendAuditLog(${entry.id})`, (prisma) =>
    prisma.auditLog.create({
      data: {
        id: entry.id,
        cycleId: entry.cycleId,
        reviewId: entry.reviewId,
        actorId: entry.actorId,
        action: entry.action,
        visibilityScope: entry.visibilityScope,
        targetEmployeeId: entry.targetEmployeeId,
        targetManagerId: entry.targetManagerId,
        reason: entry.reason,
        metadata: entry.metadata ?? undefined,
        createdAt: new Date(entry.createdAt),
      },
    })
  );

  return entry;
}

export function getAuditLogs() {
  return state.auditLogs;
}
