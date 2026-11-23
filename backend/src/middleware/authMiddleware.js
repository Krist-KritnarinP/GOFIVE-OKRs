import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

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
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      name: payload.name,
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
