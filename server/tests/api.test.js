import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import request from 'supertest';
import { assertTestDatabaseUri } from './helpers/testDatabase.js';

// Use a separate database so tests never touch real data.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = assertTestDatabaseUri(
  process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/raktsetu_test',
);

const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { createApp } = await import('../src/app.js');
const { seedDemoData } = await import('../src/seed/demoData.js');
const { DEMO_PASSWORD } = await import('../src/seed/demoAccounts.js');
const { Facility, User } = await import('../src/models/index.js');

const app = createApp();

async function loginAs(email, password = DEMO_PASSWORD) {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ identifier: email, password });
  assert.equal(res.status, 200, `login failed for ${email}: ${res.body.message}`);
  return agent;
}

const inventoryOf = async (name) => (await Facility.findOne({ name }).lean()).inventory;

before(async () => {
  await connectDB(process.env.MONGODB_URI);
  await seedDemoData();
});

after(async () => {
  await disconnectDB();
});

describe('public API', () => {
  test('health check reports the database connection', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.database, 'connected');
  });

  test('stats only count verified blood banks', async () => {
    const res = await request(app).get('/api/public/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.bloodBanks, 4);
    assert.ok(res.body.unitsAvailable > 0);
    assert.equal(Object.keys(res.body.stockByGroup).length, 8);
  });

  test('blood bank search filters by city and stock', async () => {
    const res = await request(app)
      .get('/api/public/blood-banks')
      .query({ city: 'jaipur', bloodGroup: 'O-', inStock: 'true' });
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.items.map((bank) => bank.name),
      ['Pink City Blood Centre', 'Aravali Community Blood Bank'],
    );

    const none = await request(app)
      .get('/api/public/blood-banks')
      .query({ city: 'Udaipur', bloodGroup: 'O-', inStock: 'true' });
    assert.equal(none.body.total, 0);
  });

  test('unverified blood banks are hidden', async () => {
    const pending = await Facility.findOne({ name: 'Chambal Valley Blood Bank' });
    const res = await request(app).get(`/api/public/blood-banks/${pending._id}`);
    assert.equal(res.status, 404);
  });

  test('contact form validates input and stores messages', async () => {
    const bad = await request(app)
      .post('/api/public/contact')
      .send({ name: 'A', email: 'nope', subject: 'Hi', message: 'short' });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.errors.email);
    assert.ok(bad.body.errors.message);

    const ok = await request(app).post('/api/public/contact').send({
      name: 'Test Person',
      email: 'test@example.com',
      subject: 'Hello there',
      message: 'This is a test message.',
    });
    assert.equal(ok.status, 201);
  });

  test('unknown API routes return JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    assert.equal(res.status, 404);
    assert.match(res.body.message, /No API route/);
  });
});

describe('registration and login', () => {
  const donor = {
    role: 'donor',
    name: 'Test Donor',
    email: 'test.donor@example.com',
    phone: '+91 91234 56789',
    password: 'Secret123',
    city: 'jaipur',
    bloodGroup: 'A+',
    gender: 'female',
    dateOfBirth: '1996-04-12',
    weightKg: '58',
    lastDonationDate: '',
  };

  test('shows field errors for invalid sign-ups', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...donor, email: 'bad', dateOfBirth: '2015-01-01' });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.email);
    assert.match(res.body.errors.dateOfBirth, /between 18 and 65/);
  });

  test('registers a donor, normalises fields and signs them in', async () => {
    const agent = request.agent(app);
    const res = await agent.post('/api/auth/register').send(donor);
    assert.equal(res.status, 201);
    assert.equal(res.body.user.phone, '9123456789');
    assert.equal(res.body.user.city, 'Jaipur');
    assert.equal(res.body.user.passwordHash, undefined);
    assert.equal(res.body.user.eligibility.eligible, true);

    const me = await agent.get('/api/auth/me');
    assert.equal(me.body.user.email, donor.email);
  });

  test('rejects duplicate email or mobile number', async () => {
    const res = await request(app).post('/api/auth/register').send(donor);
    assert.equal(res.status, 409);
    assert.ok(res.body.errors.email);
  });

  test('registers a blood bank as pending verification', async () => {
    const res = await request(app).post('/api/auth/register').send({
      role: 'bloodbank',
      name: 'Bank Manager',
      email: 'bank.manager@example.com',
      phone: '9123400000',
      password: 'Secret123',
      city: 'Ajmer',
      facilityName: 'Test Blood Bank',
      licenseNumber: 'RJ/BB/TEST',
      address: '1 Test Road, Ajmer',
      pincode: '305001',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.facility.verification.status, 'pending');
    assert.equal(res.body.user.facility.inventory['O+'], 0);
  });

  test('login works with email or mobile number and rejects wrong passwords', async () => {
    const wrong = await request(app).post('/api/auth/login').send({ identifier: donor.email, password: 'Wrong1234' });
    assert.equal(wrong.status, 401);

    const byPhone = await request(app)
      .post('/api/auth/login')
      .send({ identifier: '09123456789', password: donor.password });
    assert.equal(byPhone.status, 200);
    assert.ok(
      byPhone.headers['set-cookie'].some((cookie) => cookie.startsWith('rs_session=') && cookie.includes('HttpOnly')),
    );
  });

  test('logout clears the session', async () => {
    const agent = await loginAs('seeker@raktsetu.test');
    await agent.post('/api/auth/logout');
    const me = await agent.get('/api/auth/me');
    assert.equal(me.body.user, null);
  });
});

describe('access control', () => {
  test('anonymous users get 401 and other roles get 403', async () => {
    assert.equal((await request(app).get('/api/admin/overview')).status, 401);
    const donor = await loginAs('donor@raktsetu.test');
    assert.equal((await donor.get('/api/admin/overview')).status, 403);
    assert.equal((await donor.get('/api/bloodbank/overview')).status, 403);
  });

  test('unverified blood banks cannot look up donors', async () => {
    const agent = await loginAs('chambal.bank@raktsetu.test');
    const res = await agent.get('/api/bloodbank/donors/lookup').query({ q: '9855000001' });
    assert.equal(res.status, 403);
  });
});

describe('blood request lifecycle', () => {
  let seeker;
  let bank;
  let donor;
  let pinkCityId;
  let requestId;

  before(async () => {
    seeker = await loginAs('seeker@raktsetu.test');
    bank = await loginAs('bloodbank@raktsetu.test');
    donor = await loginAs('donor@raktsetu.test');
    pinkCityId = (await Facility.findOne({ name: 'Pink City Blood Centre' }))._id.toString();
  });

  test('a seeker creates a request', async () => {
    const res = await seeker.post('/api/requests').send({
      bloodBank: pinkCityId,
      patientName: 'Test Patient',
      bloodGroup: 'O+',
      units: 2,
      urgency: 'urgent',
      hospitalName: 'Test Hospital',
      city: 'Jaipur',
      contactPhone: '9833000001',
    });
    assert.equal(res.status, 201);
    assert.match(res.body.request.code, /^RS-\d{4}$/);
    assert.equal(res.body.request.status, 'pending');
    requestId = res.body.request._id;

    const mine = await seeker.get('/api/requests/mine');
    assert.ok(mine.body.items.some((item) => item._id === requestId));
    assert.ok(mine.body.counts.pending >= 1);
  });

  test('a compatible donor in the same city can offer to help', async () => {
    const list = await donor.get('/api/donor/requests');
    const match = list.body.items.find((item) => item._id === requestId);
    assert.ok(match, 'request should match an O+ donor in Jaipur');
    assert.equal(match.contactPhone, undefined, 'contact details stay hidden until the donor responds');

    const res = await donor.post(`/api/donor/requests/${requestId}/respond`);
    assert.equal(res.status, 200);
    assert.equal(res.body.request.responded, true);
    assert.equal(res.body.request.contactPhone, '9833000001');

    const detail = await seeker.get(`/api/requests/${requestId}`);
    assert.equal(detail.body.request.donorResponses[0].donor.name, 'Aarav Sharma');
  });

  test('other users cannot read the request', async () => {
    const other = await loginAs('hospital@raktsetu.test');
    assert.equal((await other.get(`/api/requests/${requestId}`)).status, 404);
  });

  test('the blood bank approves it and stock goes down', async () => {
    const before = (await inventoryOf('Pink City Blood Centre'))['O+'];
    const res = await bank.patch(`/api/bloodbank/requests/${requestId}`).send({ action: 'approve' });
    assert.equal(res.status, 200);
    assert.equal(res.body.request.status, 'approved');
    assert.equal((await inventoryOf('Pink City Blood Centre'))['O+'], before - 2);

    const again = await bank.patch(`/api/bloodbank/requests/${requestId}`).send({ action: 'approve' });
    assert.equal(again.status, 409);
  });

  test('approved requests can be handed over', async () => {
    const res = await bank.patch(`/api/bloodbank/requests/${requestId}`).send({ action: 'fulfill' });
    assert.equal(res.status, 200);
    assert.equal(res.body.request.status, 'fulfilled');
    assert.deepEqual(
      res.body.request.history.map((entry) => entry.status),
      ['pending', 'approved', 'fulfilled'],
    );
  });

  test('approval fails without enough stock and the request stays pending', async () => {
    const created = await seeker.post('/api/requests').send({
      bloodBank: pinkCityId,
      patientName: 'Rare Group Patient',
      bloodGroup: 'AB-',
      units: 9,
      hospitalName: 'Test Hospital',
      city: 'Jaipur',
      contactPhone: '9833000001',
    });
    assert.equal(created.status, 201);
    const id = created.body.request._id;

    const res = await bank.patch(`/api/bloodbank/requests/${id}`).send({ action: 'approve' });
    assert.equal(res.status, 409);
    assert.match(res.body.message, /Not enough AB- units/);

    const detail = await bank.get(`/api/requests/${id}`);
    assert.equal(detail.body.request.status, 'pending');
    assert.equal(detail.body.request.history.length, 1);

    const noReason = await bank.patch(`/api/bloodbank/requests/${id}`).send({ action: 'decline' });
    assert.equal(noReason.status, 400);
    const declined = await bank
      .patch(`/api/bloodbank/requests/${id}`)
      .send({ action: 'decline', note: 'Please contact the state blood bank.' });
    assert.equal(declined.body.request.status, 'declined');
  });

  test('declining an approved request returns the units to stock', async () => {
    const created = await seeker.post('/api/requests').send({
      bloodBank: pinkCityId,
      patientName: 'Another Patient',
      bloodGroup: 'B+',
      units: 3,
      hospitalName: 'Test Hospital',
      city: 'Jaipur',
      contactPhone: '9833000001',
    });
    const id = created.body.request._id;
    const start = (await inventoryOf('Pink City Blood Centre'))['B+'];

    await bank.patch(`/api/bloodbank/requests/${id}`).send({ action: 'approve' });
    assert.equal((await inventoryOf('Pink City Blood Centre'))['B+'], start - 3);

    await bank.patch(`/api/bloodbank/requests/${id}`).send({ action: 'decline', note: 'Patient was discharged.' });
    assert.equal((await inventoryOf('Pink City Blood Centre'))['B+'], start);
  });

  test('requesters can cancel only pending requests', async () => {
    const created = await seeker.post('/api/requests').send({
      bloodBank: pinkCityId,
      patientName: 'Cancel Me',
      bloodGroup: 'A+',
      units: 1,
      hospitalName: 'Test Hospital',
      city: 'Jaipur',
      contactPhone: '9833000001',
    });
    const id = created.body.request._id;
    assert.equal((await seeker.patch(`/api/requests/${id}/cancel`)).body.request.status, 'cancelled');
    assert.equal((await seeker.patch(`/api/requests/${id}/cancel`)).status, 409);
  });

  test('hospital requests use the hospital name and city automatically', async () => {
    const hospital = await loginAs('hospital@raktsetu.test');
    const res = await hospital.post('/api/requests').send({
      bloodBank: pinkCityId,
      patientName: 'Ward 4 Patient',
      bloodGroup: 'A+',
      units: 1,
      contactPhone: '0141-2988800',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.request.hospitalName, 'Sanjeevani Multispeciality Hospital');
    assert.equal(res.body.request.city, 'Jaipur');
  });
});

describe('blood bank stock and donations', () => {
  let bank;
  before(async () => {
    bank = await loginAs('bloodbank@raktsetu.test');
  });

  test('stock adjustments are validated and logged', async () => {
    const tooMany = await bank
      .post('/api/bloodbank/inventory/adjust')
      .send({ bloodGroup: 'AB-', change: -100, reason: 'adjustment' });
    assert.equal(tooMany.status, 409);

    const wrongDirection = await bank
      .post('/api/bloodbank/inventory/adjust')
      .send({ bloodGroup: 'A+', change: 5, reason: 'expired' });
    assert.equal(wrongDirection.status, 400);

    const before = (await inventoryOf('Pink City Blood Centre'))['A-'];
    const ok = await bank
      .post('/api/bloodbank/inventory/adjust')
      .send({ bloodGroup: 'A-', change: 5, reason: 'received', note: 'Camp' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.inventory['A-'], before + 5);
    assert.equal(ok.body.movement.balanceAfter, before + 5);

    const history = await bank.get('/api/bloodbank/inventory');
    assert.equal(history.body.movements[0].note, 'Camp');
  });

  test('donor lookup shows eligibility', async () => {
    const res = await bank.get('/api/bloodbank/donors/lookup').query({ q: '+91 98550 00007' });
    assert.equal(res.status, 200);
    assert.equal(res.body.donor.name, 'Imran Qureshi');
    assert.equal(res.body.donor.eligibility.eligible, false);
  });

  test('donations from ineligible donors are refused', async () => {
    const imran = await User.findOne({ email: 'imran.q@raktsetu.test' });
    const res = await bank.post('/api/bloodbank/donations').send({ donorId: imran._id.toString() });
    assert.equal(res.status, 409);
    assert.match(res.body.message, /cannot donate yet/);
  });

  test('recording a donation adds stock and updates the donor', async () => {
    const sneha = await User.findOne({ email: 'sneha.a@raktsetu.test' });
    const before = (await inventoryOf('Pink City Blood Centre'))['O-'];

    const res = await bank.post('/api/bloodbank/donations').send({ donorId: sneha._id.toString(), units: 1 });
    assert.equal(res.status, 201);
    assert.equal((await inventoryOf('Pink City Blood Centre'))['O-'], before + 1);

    const updated = await User.findById(sneha._id);
    assert.ok(updated.donor.lastDonationDate);

    const walkIn = await bank
      .post('/api/bloodbank/donations')
      .send({ donorName: 'Walk In', bloodGroup: 'B+', units: 1 });
    assert.equal(walkIn.status, 201);
  });
});

describe('donor profile', () => {
  test('unavailable donors cannot respond to requests', async () => {
    const donor = await loginAs('donor@raktsetu.test');
    const update = await donor.patch('/api/account').send({ isAvailable: false });
    assert.equal(update.status, 200);
    assert.equal(update.body.user.donor.isAvailable, false);
    assert.equal(update.body.user.state, 'Rajasthan', 'fields that were not sent must not change');

    const list = await donor.get('/api/donor/requests');
    const open = list.body.items.find((item) => !item.responded);
    if (open) {
      const res = await donor.post(`/api/donor/requests/${open._id}/respond`);
      assert.equal(res.status, 409);
    }
    await donor.patch('/api/account').send({ isAvailable: true });
  });
});

describe('admin', () => {
  let admin;
  before(async () => {
    admin = await loginAs('admin@raktsetu.test');
  });

  test('overview returns counts and monthly activity', async () => {
    const res = await admin.get('/api/admin/overview');
    assert.equal(res.status, 200);
    assert.equal(res.body.monthly.length, 6);
    assert.ok(res.body.users.donor >= 24);
    assert.ok(res.body.facilities.bloodbank.pending >= 1);
  });

  test('verifying a blood bank makes it public', async () => {
    const list = await admin.get('/api/admin/facilities').query({ status: 'pending', type: 'bloodbank' });
    const chambal = list.body.items.find((item) => item.name === 'Chambal Valley Blood Bank');

    const reject = await admin.patch(`/api/admin/facilities/${chambal._id}/review`).send({ status: 'rejected' });
    assert.equal(reject.status, 400, 'a reason is required when rejecting');

    const res = await admin.patch(`/api/admin/facilities/${chambal._id}/review`).send({ status: 'verified' });
    assert.equal(res.status, 200);
    assert.equal((await request(app).get(`/api/public/blood-banks/${chambal._id}`)).status, 200);
  });

  test('suspended users cannot log in, and admins cannot be suspended here', async () => {
    const users = await admin.get('/api/admin/users').query({ search: 'farhan' });
    const farhan = users.body.items[0];
    const res = await admin.patch(`/api/admin/users/${farhan._id}/status`).send({ isActive: false });
    assert.equal(res.status, 200);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'farhan.ali@raktsetu.test', password: DEMO_PASSWORD });
    assert.equal(login.status, 403);

    const self = await admin.get('/api/auth/me');
    const selfRes = await admin.patch(`/api/admin/users/${self.body.user._id}/status`).send({ isActive: false });
    assert.equal(selfRes.status, 400);
  });

  test('deleting a seeker cancels their pending requests', async () => {
    const users = await admin.get('/api/admin/users').query({ search: 'lokesh' });
    const res = await admin.delete(`/api/admin/users/${users.body.items[0]._id}`);
    assert.equal(res.status, 200);
    assert.equal(await User.countDocuments({ email: 'lokesh.p@raktsetu.test' }), 0);
  });

  test('messages can be filtered and updated', async () => {
    const list = await admin.get('/api/admin/messages').query({ status: 'new' });
    assert.ok(list.body.items.length >= 1);
    const res = await admin.patch(`/api/admin/messages/${list.body.items[0]._id}`).send({ status: 'resolved' });
    assert.equal(res.body.item.status, 'resolved');
  });
});

describe('password reset', () => {
  test('reset link changes the password and signs out old sessions', async () => {
    const oldSession = await loginAs('kavya.jain@raktsetu.test');

    const forgot = await request(app).post('/api/auth/forgot-password').send({ email: 'kavya.jain@raktsetu.test' });
    assert.equal(forgot.status, 200);
    const token = forgot.body.devResetUrl.split('/').pop();

    const unknown = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.com' });
    assert.equal(unknown.status, 200, 'does not reveal whether an email is registered');
    assert.equal(unknown.body.devResetUrl, undefined);

    // Make sure the new token is issued in a later second than the old one.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const reset = await request(app).post('/api/auth/reset-password').send({ token, password: 'NewPass123' });
    assert.equal(reset.status, 200);

    const reused = await request(app).post('/api/auth/reset-password').send({ token, password: 'NewPass123' });
    assert.equal(reused.status, 400);

    assert.equal((await oldSession.get('/api/auth/me')).body.user, null);
    await loginAs('kavya.jain@raktsetu.test', 'NewPass123');
  });
});
