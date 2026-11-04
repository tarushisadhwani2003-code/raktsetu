import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readBloodGroup } from '../../client/src/lib/blood.js';
import { quickEligibilityCheck } from '../../client/src/lib/eligibility.js';
import * as clientConstants from '../../client/src/lib/constants.js';
import * as serverConstants from '../../server/src/utils/constants.js';
import { donorEligibility } from '../../server/src/utils/eligibility.js';
import { BLOOD_GROUPS, COMPATIBLE_DONORS, emptyInventory, recipientsFor, totalInventory } from '../domain.js';

test('client and server use the same compatibility data', () => {
  assert.equal(clientConstants.BLOOD_GROUPS, serverConstants.BLOOD_GROUPS);
  assert.equal(clientConstants.COMPATIBLE_DONORS, serverConstants.COMPATIBLE_DONORS);
  assert.deepEqual(recipientsFor('O-'), BLOOD_GROUPS);
  assert.deepEqual(recipientsFor('AB+'), ['AB+']);
  assert.deepEqual(COMPATIBLE_DONORS['O+'], ['O+', 'O-']);
  assert.deepEqual(recipientsFor('unknown'), []);
});

test('inventories are independent and totals ignore unknown fields', () => {
  const first = emptyInventory();
  const second = emptyInventory();
  first['A+'] = 12;
  assert.equal(second['A+'], 0);
  assert.equal(totalInventory(first), 12);
  assert.equal(totalInventory({ 'A+': 2, 'O-': 3, extra: 100 }), 5);
  assert.equal(totalInventory(), 0);
});

test('blood group links preserve plus signs and reject invalid groups', () => {
  assert.equal(readBloodGroup(new URLSearchParams('group=O+').get('group')), 'O+');
  assert.equal(readBloodGroup(new URLSearchParams('group=AB%2B').get('group')), 'AB+');
  assert.equal(readBloodGroup('a-'), 'A-');
  assert.equal(readBloodGroup('X+'), '');
  assert.equal(readBloodGroup(null), '');
});

test('shared screening thresholds retain the existing age and weight boundaries', () => {
  const check = (age, weight) => quickEligibilityCheck({ age, weight, gender: 'male' }).eligible;
  assert.equal(check(17, 50), false);
  assert.equal(check(18, 45), true);
  assert.equal(check(65, 45), true);
  assert.equal(check(66, 50), false);
  assert.equal(check(25, 44), false);
});

test('donation intervals retain the existing 90 and 120 day boundaries', () => {
  const donor = { dateOfBirth: '1990-01-01', lastDonationDate: new Date(2025, 0, 1) };
  const date = new Date(2025, 3, 1, 12);
  assert.equal(donorEligibility({ ...donor, gender: 'male' }, date).eligible, true);
  assert.equal(donorEligibility({ ...donor, gender: 'female' }, date).eligible, false);
  assert.equal(donorEligibility({ ...donor, gender: 'other' }, new Date(2025, 4, 1, 12)).eligible, true);
});
