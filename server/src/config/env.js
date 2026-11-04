import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SERVER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CLIENT_DIST = path.resolve(SERVER_ROOT, '../client/dist');

// Load server/.env when it exists. Variables already set by the host win.
const envFile = path.join(SERVER_ROOT, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const isTest = nodeEnv === 'test';
const isVercel = process.env.VERCEL === '1';

if (isProd && !process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be set in production. Use a database reachable from your host.');
}
if (isVercel && isProd) {
  let clientUrl;
  try {
    clientUrl = new URL(process.env.CLIENT_URL);
  } catch {
    /* validated below */
  }
  if (
    !clientUrl ||
    clientUrl.protocol !== 'https:' ||
    clientUrl.username ||
    clientUrl.password ||
    clientUrl.pathname !== '/' ||
    clientUrl.search ||
    clientUrl.hash
  ) {
    throw new Error(
      'CLIENT_URL must be your HTTPS website origin on Vercel, for example https://your-project.vercel.app.',
    );
  }
}
if (isVercel && process.env.SEED_DEMO_DATA === 'true') {
  throw new Error('Automatic demo seeding is disabled on Vercel. Use the local seed command on a disposable database.');
}

const list = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const flag = (value, fallback) => (value === undefined || value === '' ? fallback : value === 'true');

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (isProd) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production.');
  }
  if (!isTest) {
    console.warn('⚠  JWT_SECRET is not set (or too short). Using an insecure development secret.');
  }
  return 'development-only-secret-do-not-use-in-production-0000';
}

export const env = Object.freeze({
  nodeEnv,
  isProd,
  isTest,
  isVercel,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raktsetu',
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: (process.env.CLIENT_URL || (isProd ? '' : 'http://localhost:5173')).replace(/\/$/, ''),
  corsOrigins: list(process.env.CORS_ORIGINS),
  demoMode: flag(process.env.DEMO_MODE, !isProd),
  seedDemoData: flag(process.env.SEED_DEMO_DATA, false),
  serveClient: flag(process.env.SERVE_CLIENT, !isVercel),
  admin: {
    name: process.env.ADMIN_NAME || 'RaktSetu Admin',
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '',
    phone: (process.env.ADMIN_PHONE || '').trim(),
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  mailFrom: process.env.MAIL_FROM || 'RaktSetu <no-reply@raktsetu.in>',
});
