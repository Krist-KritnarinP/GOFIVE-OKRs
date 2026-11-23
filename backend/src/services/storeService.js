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

export function getUserByEmail(email) {
  return state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getUsersMap() {
  return new Map(state.users.map((u) => [u.id, u]));
}

export function getGoalsByEmployee(employeeId) {
  return state.goals.filter((g) => g.employeeId === employeeId);
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

export function appendAuditLog({ cycleId, reviewId = null, actor, action, reason = null, metadata = null }) {
  const entry = {
    id: `aud-${crypto.randomUUID().slice(0, 8)}`,
    cycleId,
    reviewId,
    actorId: actor.id,
    actorName: actor.name,
    action,
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
