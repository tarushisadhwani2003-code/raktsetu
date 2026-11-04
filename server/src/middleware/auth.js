import { User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { AUTH_COOKIE, verifyToken } from '../utils/tokens.js';

/**
 * Reads the session cookie and attaches the logged-in user to req.user.
 * Requests without a valid session simply continue as anonymous.
 */
export async function authenticate(req, _res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return next();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next();
  }

  const user = await User.findById(payload.sub).populate('facility');
  if (!user || !user.isActive) return next();

  // Sessions created before the latest password change are no longer valid.
  const issuedAt = payload.iat * 1000;
  if (user.passwordChangedAt && issuedAt < user.passwordChangedAt.getTime() - 1000) return next();

  req.user = user;
  next();
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  next();
}

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };

/** Blood banks and hospitals must be approved by an admin before using some features. */
export function requireVerifiedFacility(req, _res, next) {
  if (req.user?.facility?.verification?.status !== 'verified') {
    return next(ApiError.forbidden('Your facility is waiting for verification by the RaktSetu team.'));
  }
  next();
}
