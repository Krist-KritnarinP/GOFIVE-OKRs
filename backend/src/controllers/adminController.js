import { toPublicUser } from './authController.js';
import {
  appendAuditLog,
  getAuditLogs,
  getRolePermissions,
  getUserById,
  getUsers,
  setRolePermission,
  updateUser,
} from '../services/storeService.js';

export function listAdminUsers(_req, res) {
  res.json({
    ok: true,
    data: {
      users: getUsers().map(toPublicUser),
      rolePermissions: getRolePermissions(),
      auditLogs: getAuditLogs(),
    },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function patchAdminUser(req, res) {
  const { userId } = req.params;
  const target = getUserById(userId);
  if (!target) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
  }

  const patch = req.validatedBody;
  const updated = updateUser(userId, patch);

  appendAuditLog({
    actor: req.user,
    action: 'ADMIN_UPDATE_USER',
    reason: `Updated ${updated.employeeCode} (${updated.name}): role=${updated.role}, status=${updated.accountStatus}`,
    metadata: { targetUserId: userId, ...patch },
  });

  return res.json({
    ok: true,
    data: { user: toPublicUser(updated) },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function getAdminPermissions(_req, res) {
  res.json({
    ok: true,
    data: { rolePermissions: getRolePermissions() },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function putAdminPermission(req, res) {
  const { role, permissionKey, allowed } = req.validatedBody;
  const updated = setRolePermission(role, permissionKey, allowed);

  appendAuditLog({
    actor: req.user,
    action: 'UPDATE_ROLE_PERMISSION',
    reason: `Set ${role} -> ${permissionKey} = ${allowed ? 'ALLOW' : 'DENY'}`,
    metadata: { role, permissionKey, allowed },
  });

  return res.json({
    ok: true,
    data: { rolePermissions: updated },
    meta: { timestamp: new Date().toISOString() },
  });
}
