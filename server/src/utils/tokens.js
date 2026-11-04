import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'rs_session';

const UNIT_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

/** "7d" -> milliseconds (also accepts a plain number of seconds). */
export function durationToMs(value) {
  const match = /^(\d+)\s*([smhd])?$/.exec(String(value).trim());
  if (!match) return 7 * UNIT_MS.d;
  return Number(match[1]) * UNIT_MS[match[2] || 's'];
}

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProd,
  path: '/',
});

export function setAuthCookie(res, user) {
  res.cookie(AUTH_COOKIE, signToken(user), { ...cookieOptions(), maxAge: durationToMs(env.jwtExpiresIn) });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions());
}

/** Random token for password-reset links. Only the SHA-256 hash is stored. */
export function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: hashToken(token) };
}

export const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');
