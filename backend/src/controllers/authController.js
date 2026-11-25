import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import {
  appendAuditLog,
  createUser,
  getPermissionsForRole,
  getUserByEmployeeCode,
  getUserById,
  getUsers,
} from '../services/storeService.js';

const DEPT_MANAGER_MAP = {
  engineering: 'usr-mgr-eng',
  sales: 'usr-mgr-sales',
  product: 'usr-mgr-prod',
  operations: 'usr-mgr-prod',
  'human resources': 'usr-hr',
};

function defaultManagerForDepartment(department) {
  const key = String(department || '').trim().toLowerCase();
  return DEPT_MANAGER_MAP[key] || 'usr-mgr-eng';
}

export function toPublicUser(user) {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    email: user.email,
    name: user.name,
    nameTh: user.nameTh,
    title: user.title,
    department: user.department,
    jobLevel: user.jobLevel || 'L2_MID',
    role: user.role,
    accountStatus: user.accountStatus,
    managerId: user.managerId,
  };
}

function signUserToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      employeeCode: user.employeeCode,
      role: user.role,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function listDemoAccounts(_req, res) {
  const demoIds = ['usr-super', 'usr-hr', 'usr-mgr-eng', 'usr-emp-nida'];
  const accounts = getUsers()
    .filter((u) => demoIds.includes(u.id))
    .map(toPublicUser);

  res.json({
    ok: true,
    data: { accounts },
    meta: { timestamp: new Date().toISOString() },
  });
}

export async function register(req, res) {
  const { employeeCode, name, department, title, jobLevel, password } = req.validatedBody;
  const existing = getUserByEmployeeCode(employeeCode);

  if (existing) {
    return res.status(409).json({
      ok: false,
      error: {
        code: 'CONFLICT',
        message: `Employee code ${employeeCode} is already registered.`,
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = createUser({
    employeeCode,
    email: `${employeeCode.toLowerCase()}@empeo.demo`,
    passwordHash,
    name,
    nameTh: name,
    title,
    department,
    jobLevel: jobLevel || 'L2_MID',
    role: 'EMPLOYEE',
    accountStatus: 'PENDING_APPROVAL',
    managerId: defaultManagerForDepartment(department),
  });

  appendAuditLog({
    actor: { id: created.id, name: created.name, role: 'EMPLOYEE' },
    action: 'USER_REGISTERED',
    visibilityScope: 'ADMIN_SECURITY',
    targetEmployeeId: created.id,
    reason: `New employee registration (${employeeCode}) awaiting Super Admin approval.`,
  });

  return res.status(201).json({
    ok: true,
    data: { user: toPublicUser(created) },
    meta: { timestamp: new Date().toISOString() },
  });
}

export async function login(req, res) {
  const { employeeCode, password } = req.validatedBody;
  const user = getUserByEmployeeCode(employeeCode);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid employee code or password.',
      },
    });
  }

  if (user.accountStatus === 'PENDING_APPROVAL') {
    return res.status(403).json({
      ok: false,
      error: {
        code: 'ACCOUNT_PENDING',
        message: 'Your account is pending Super Admin approval.',
      },
    });
  }

  if (user.accountStatus === 'SUSPENDED') {
    return res.status(403).json({
      ok: false,
      error: {
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Contact Super Admin.',
      },
    });
  }

  return res.json({
    ok: true,
    data: {
      token: signUserToken(user),
      user: toPublicUser(user),
      permissions: getPermissionsForRole(user.role),
    },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function demoSwitch(req, res) {
  if (env.NODE_ENV === 'production' && !env.ENABLE_DEMO_MODE) {
    return res.status(403).json({
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Demo account switching is disabled in production.',
      },
    });
  }

  const { userId } = req.validatedBody;
  const user = getUserById(userId);

  if (!user || user.accountStatus !== 'ACTIVE') {
    return res.status(404).json({
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Active demo account not found.',
      },
    });
  }

  return res.json({
    ok: true,
    data: {
      token: signUserToken(user),
      user: toPublicUser(user),
      permissions: getPermissionsForRole(user.role),
    },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function getMe(req, res) {
  const user = getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'User not found.' },
    });
  }
  return res.json({
    ok: true,
    data: {
      user: toPublicUser(user),
      permissions: getPermissionsForRole(user.role),
    },
    meta: { timestamp: new Date().toISOString() },
  });
}
