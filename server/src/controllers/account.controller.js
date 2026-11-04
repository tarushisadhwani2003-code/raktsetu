import { Facility, User } from '../models/index.js';
import { deleteUserAccount } from '../services/account.service.js';
import { ApiError } from '../utils/ApiError.js';
import { clearAuthCookie, setAuthCookie } from '../utils/tokens.js';
import { updateAccountSchema } from '../validators/account.schemas.js';

const ACCOUNT_FIELDS = ['name', 'email', 'phone', 'city', 'state'];
const DONOR_FIELDS = ['bloodGroup', 'gender', 'dateOfBirth', 'weightKg', 'lastDonationDate', 'isAvailable'];
const FACILITY_FIELDS = {
  facilityName: 'name',
  licenseNumber: 'licenseNumber',
  address: 'address',
  pincode: 'pincode',
  facilityPhone: 'phone',
  openingHours: 'openingHours',
};
// Changing these on a verified facility sends it back for review.
const FIELDS_NEEDING_REVIEW = ['name', 'licenseNumber'];

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export async function updateAccount(req, res) {
  const user = req.user;
  const parsed = updateAccountSchema(user.role).parse(req.body ?? {});
  // Only apply fields the client actually sent (schema defaults must not overwrite stored values).
  const sent = Object.fromEntries(Object.entries(parsed).filter(([key]) => has(req.body, key)));

  if (sent.email && sent.email !== user.email && (await User.exists({ email: sent.email }))) {
    throw ApiError.conflict('An account with this email already exists.', {
      email: 'An account with this email already exists.',
    });
  }
  if (sent.phone && sent.phone !== user.phone && (await User.exists({ phone: sent.phone }))) {
    throw ApiError.conflict('An account with this mobile number already exists.', {
      phone: 'An account with this mobile number already exists.',
    });
  }

  for (const key of ACCOUNT_FIELDS) if (has(sent, key)) user[key] = sent[key];

  if (user.role === 'donor' && user.donor) {
    for (const key of DONOR_FIELDS) if (has(sent, key)) user.donor[key] = sent[key] ?? null;
  }

  if (user.facility) {
    const facility = await Facility.findById(user.facility._id);
    let needsReview = false;
    for (const [inputKey, facilityKey] of Object.entries(FACILITY_FIELDS)) {
      if (!has(sent, inputKey) || sent[inputKey] === undefined) continue;
      if (FIELDS_NEEDING_REVIEW.includes(facilityKey) && facility[facilityKey] !== sent[inputKey]) needsReview = true;
      facility[facilityKey] = sent[inputKey];
    }
    if (has(sent, 'city')) facility.city = sent.city;
    if (has(sent, 'state')) facility.state = sent.state;
    if (needsReview && facility.verification.status === 'verified') {
      facility.verification.status = 'pending';
      facility.verification.note = 'Name or licence number changed — waiting for re-verification.';
    }
    await facility.save();
  }

  await user.save();
  await user.populate('facility');
  res.json({ user, message: 'Your profile has been updated.' });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.valid.body;
  const user = await User.findById(req.user._id).select('+passwordHash');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Your current password is not correct.', {
      currentPassword: 'Your current password is not correct.',
    });
  }

  await user.setPassword(newPassword);
  await user.save({ validateModifiedOnly: true });

  // Other sessions are now signed out; keep this one signed in with a fresh token.
  setAuthCookie(res, user);
  res.json({ message: 'Your password has been changed.' });
}

export async function deleteAccount(req, res) {
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.comparePassword(req.valid.body.password))) {
    throw ApiError.badRequest('That password is not correct.', { password: 'That password is not correct.' });
  }

  await deleteUserAccount(user, { by: user._id, reason: 'The requester deleted their account.' });
  clearAuthCookie(res);
  res.json({ message: 'Your account has been deleted.' });
}
