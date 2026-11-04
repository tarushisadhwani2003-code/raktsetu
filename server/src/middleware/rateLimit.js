import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const MINUTE = 60 * 1000;

const limiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.isTest,
    message: { message },
  });

export const apiLimiter = limiter(15 * MINUTE, 600, 'Too many requests. Please slow down and try again shortly.');

export const authLimiter = limiter(15 * MINUTE, 30, 'Too many attempts. Please wait a few minutes and try again.');

export const contactLimiter = limiter(
  60 * MINUTE,
  8,
  'You have sent several messages already. Please try again later.',
);
