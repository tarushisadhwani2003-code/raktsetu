import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import crypto from 'node:crypto';
import { assertTestDatabaseUri } from './helpers/testDatabase.js';

process.env.NODE_ENV = 'test';
process.env.VERCEL = '1';
process.env.SEED_DEMO_DATA = 'false';
process.env.ADMIN_EMAIL = `bootstrap-${crypto.randomUUID()}@raktsetu.test`;
process.env.ADMIN_PASSWORD = crypto.randomBytes(24).toString('hex');
process.env.MONGODB_URI = assertTestDatabaseUri(
  process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/raktsetu_test',
);

const { default: app } = await import('../../api/index.js');
const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { ensureAdminAccount } = await import('../src/services/bootstrap.service.js');
const { User } = await import('../src/models/index.js');
after(disconnectDB);

test('concurrent admin bootstrap creates one account and preserves its password on later starts', async () => {
  await connectDB(process.env.MONGODB_URI);
  await Promise.all(Array.from({ length: 5 }, () => ensureAdminAccount()));
  assert.equal(await User.countDocuments({ email: process.env.ADMIN_EMAIL }), 1);
  const admin = await User.findOne({ email: process.env.ADMIN_EMAIL }).select('+passwordHash');
  assert.equal(admin.role, 'admin');
  assert.equal(await admin.comparePassword(process.env.ADMIN_PASSWORD), true);
  const originalHash = admin.passwordHash;
  await ensureAdminAccount();
  const unchanged = await User.findById(admin._id).select('+passwordHash');
  assert.equal(unchanged.passwordHash, originalHash);
  await disconnectDB();
});

test('Vercel entry serves concurrent cold-start requests using one MongoDB connection', async () => {
  const responses = await Promise.all(Array.from({ length: 5 }, () => request(app).get('/api/health')));
  for (const response of responses) {
    assert.equal(response.status, 200);
    assert.equal(response.body.database, 'connected');
    assert.equal(response.headers['cache-control'], 'no-store');
  }
  const first = await connectDB(process.env.MONGODB_URI);
  const second = await connectDB(process.env.MONGODB_URI);
  assert.equal(first, second);
  assert.equal((await request(app).get('/api/auth/me')).body.user, null);
  assert.equal((await request(app).get('/api/not-a-route')).status, 404);
});

test('warm Vercel handler reconnects after a disconnected pool', async () => {
  await disconnectDB();
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.database, 'connected');
});
