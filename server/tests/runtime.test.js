import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
const { createApp } = await import('../src/app.js');

test('serverless initialization is awaited before routing and query strings survive', async () => {
  let initialized = false;
  const app = createApp({
    serveClient: false,
    initialize: async () => {
      initialized = true;
    },
  });
  const response = await request(app).get('/api/unknown?city=Jaipur');
  assert.equal(initialized, true);
  assert.equal(response.status, 404);
  assert.match(response.body.message, /\/api\/unknown\?city=Jaipur/);
  assert.equal(response.headers['cache-control'], 'no-store');
});

test('initialization errors return JSON 503 without leaking details, and later requests retry', async () => {
  let attempts = 0;
  const app = createApp({
    serveClient: false,
    initialize: async () => {
      if (++attempts === 1) throw new Error('private database credentials');
    },
  });
  const failed = await request(app).get('/api/health');
  assert.equal(failed.status, 503);
  assert.equal(failed.headers['cache-control'], 'no-store');
  assert.doesNotMatch(JSON.stringify(failed.body), /private database credentials/);
  assert.equal((await request(app).get('/api/unknown')).status, 404);
  assert.equal(attempts, 2);
});

test('health check reports unavailable when MongoDB is disconnected', async () => {
  const response = await request(createApp({ serveClient: false })).get('/api/health');
  assert.equal(response.status, 503);
  assert.equal(response.body.database, 'disconnected');
});
