import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getUserByEmail, getUserById, getUsers } from '../services/storeService.js';

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nameTh: user.nameTh,
    title: user.title,
    department: user.department,
    role: user.role,
    managerId: user.managerId,
  };
}

function signUserToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function listDemoAccounts(_req, res) {
  const demoIds = ['usr-hr', 'usr-mgr-eng', 'usr-mgr-sales', 'usr-emp-nida', 'usr-emp-ton', 'usr-emp-bank'];
  const accounts = getUsers()
    .filter((u) => demoIds.includes(u.id))
    .map(toPublicUser);

  res.json({
    ok: true,
    data: { accounts },
    meta: { timestamp: new Date().toISOString() },
  });
}

export async function login(req, res) {
  const { email, password } = req.validatedBody;
  const user = getUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password.',
      },
    });
  }

  return res.json({
    ok: true,
    data: { token: signUserToken(user), user: toPublicUser(user) },
    meta: { timestamp: new Date().toISOString() },
  });
}

export function demoSwitch(req, res) {
  const { userId } = req.validatedBody;
  const user = getUserById(userId);

  if (!user) {
    return res.status(404).json({
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Demo account not found.',
      },
    });
  }

  return res.json({
    ok: true,
    data: { token: signUserToken(user), user: toPublicUser(user) },
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
    data: { user: toPublicUser(user) },
    meta: { timestamp: new Date().toISOString() },
  });
}
