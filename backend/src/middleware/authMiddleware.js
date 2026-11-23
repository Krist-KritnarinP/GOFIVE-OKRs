import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getUserById, hasPermission } from '../services/storeService.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required.',
      },
    });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const liveUser = getUserById(payload.sub);

    if (!liveUser || liveUser.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        ok: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Account is not active. Contact Super Admin.',
        },
      });
    }

    req.user = {
      id: liveUser.id,
      employeeCode: liveUser.employeeCode,
      role: liveUser.role,
      email: liveUser.email,
      name: liveUser.name,
    };
    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired authentication token.',
      },
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
        },
      });
    }
    return next();
  };
}

export function requirePermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user || !hasPermission(req.user.role, permissionKey)) {
      return res.status(403).json({
        ok: false,
        error: {
          code: 'FORBIDDEN',
          message: `Missing required permission: ${permissionKey}`,
        },
      });
    }
    return next();
  };
}
