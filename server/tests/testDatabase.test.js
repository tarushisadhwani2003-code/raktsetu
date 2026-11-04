import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertTestDatabaseUri } from './helpers/testDatabase.js';

test('test database guard allows standalone and replica-set test connections', () => {
  const uris = [
    'mongodb://127.0.0.1:27017/raktsetu_test',
    'mongodb://user:pass@one:27017,two:27017/raktsetu_test?replicaSet=rs0&authSource=admin',
    'mongodb+srv://user:pass@example.com/raktsetu_test?retryWrites=true',
  ];
  for (const uri of uris) assert.equal(assertTestDatabaseUri(uri), uri);
});

test('test database guard rejects production, missing, malformed, and misleading database names', () => {
  const uris = [
    undefined,
    'mongodb://127.0.0.1:27017/raktsetu',
    'mongodb://127.0.0.1:27017/',
    'mongodb://127.0.0.1:27017/?appName=raktsetu_test',
    'mongodb://127.0.0.1:27017/raktsetu_test/production',
    'mongodb://127.0.0.1:27017/raktsetu_test%2Fproduction',
    'mongodb://127.0.0.1:27017/%ZZ_test',
    'https://example.com/raktsetu_test',
  ];
  for (const uri of uris) assert.throws(() => assertTestDatabaseUri(uri), /ending in "_test"/);
});
