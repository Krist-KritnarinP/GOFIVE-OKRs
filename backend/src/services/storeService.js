import crypto from 'node:crypto';
import { createInitialSeed } from '../data/seedData.js';

let state = createInitialSeed();

export function resetStore() {
  state = createInitialSeed();
}

export function getCycle() {
  return state.cycle;
}

export function updateCycle(patch) {
  state.cycle = { ...state.cycle, ...patch };
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
    ...userInput,
  };
  state.users.push(newUser);
  return newUser;
}

export function updateUser(userId, patch) {
  const idx = state.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  state.users[idx] = { ...state.users[idx], ...patch };
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
  if (role === 'SUPER_ADMIN' && permissionKey === 'rbac:manage') {
    state.rolePermissions[role][permissionKey] = true;
    return state.rolePermissions;
  }
  state.rolePermissions[role][permissionKey] = Boolean(allowed);
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
  return entry;
}

export function getAuditLogs() {
  return state.auditLogs;
}
