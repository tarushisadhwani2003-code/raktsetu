import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { Facility, User } from '../models/index.js';
import { sendMail } from '../services/mailer.js';
import { ApiError } from '../utils/ApiError.js';
import { emptyInventory } from '../utils/constants.js';
import { clearAuthCookie, createResetToken, hashToken, setAuthCookie } from '../utils/tokens.js';
import { registerSchemas, roleSchema } from '../validators/auth.schemas.js';

const RESET_LINK_MINUTES = 30;

// Compared against when an account does not exist, so response times don't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const normaliseMobile = (value) => value.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');

async function assertEmailAndPhoneAvailable({ email, phone }) {
  const existing = await User.findOne({ $or: [{ email }, { phone }] })
    .select('email phone')
    .lean();
  if (!existing) return;
  const errors = {};
  if (existing.email === email) errors.email = 'An account with this email already exists.';
  if (existing.phone === phone) errors.phone = 'An account with this mobile number already exists.';
  throw ApiError.conflict(Object.values(errors)[0], errors);
}

export async function register(req, res) {
  const { role } = roleSchema.parse(req.body ?? {});
  const data = registerSchemas[role].parse(req.body);

  await assertEmailAndPhoneAvailable(data);

  const user = new User({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role,
    city: data.city,
    state: data.state,
    passwordHash: await User.hashPassword(data.password),
  });

  if (role === 'donor') {
    user.donor = {
      bloodGroup: data.bloodGroup,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      weightKg: data.weightKg,
      lastDonationDate: data.lastDonationDate ?? null,
      isAvailable: true,
    };
  }

  let facility;
  if (role === 'hospital' || role === 'bloodbank') {
    facility = new Facility({
      type: role,
      name: data.facilityName,
      licenseNumber: data.licenseNumber,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      phone: data.facilityPhone || data.phone,
      email: data.email,
      openingHours: data.openingHours || 'Open 24 hours',
      owner: user._id,
      inventory: role === 'bloodbank' ? emptyInventory() : undefined,
    });
    user.facility = facility._id;
  }

  await user.save();
  if (facility) {
    try {
      await facility.save();
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  await user.populate('facility');
  setAuthCookie(res, user);
  res.status(201).json({ user });
}

export async function login(req, res) {
  const { identifier, password } = req.valid.body;
  const query = identifier.includes('@') ? { email: identifier.toLowerCase() } : { phone: normaliseMobile(identifier) };

  const user = await User.findOne(query).select('+passwordHash');
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordOk) {
    throw ApiError.unauthorized('Incorrect email / mobile number or password.');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been suspended. Please contact RaktSetu support.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });
  await user.populate('facility');

  setAuthCookie(res, user);
  res.json({ user });
}

export function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ message: 'You have been logged out.' });
}

export function me(req, res) {
  res.json({ user: req.user ?? null });
}

export async function forgotPassword(req, res) {
  const { email } = req.valid.body;
  const user = await User.findOne({ email, isActive: true });
  let devResetUrl;

  if (user) {
    const { token, hash } = createResetToken();
    user.resetPasswordTokenHash = hash;
    user.resetPasswordExpiresAt = new Date(Date.now() + RESET_LINK_MINUTES * 60 * 1000);
    await user.save({ validateModifiedOnly: true });

    const siteUrl = env.clientUrl || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${siteUrl}/reset-password/${token}`;
    const { delivered } = await sendMail({
      to: user.email,
      subject: 'Reset your RaktSetu password',
      text: [
        `Hello ${user.name},`,
        '',
        'We received a request to reset your RaktSetu password.',
        `Open this link within ${RESET_LINK_MINUTES} minutes to choose a new password:`,
        resetUrl,
        '',
        'If you did not ask for this, you can ignore this email.',
      ].join('\n'),
    });

    if (!delivered && !env.isProd) devResetUrl = resetUrl;
  }

  res.json({
    message: 'If an account exists for that email, we have sent a link to reset the password.',
    ...(devResetUrl && { devResetUrl }),
  });
}

export async function resetPassword(req, res) {
  const { token, password } = req.valid.body;
  const user = await User.findOne({
    resetPasswordTokenHash: hashToken(token),
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');

  if (!user) {
    throw ApiError.badRequest('This reset link is invalid or has expired. Please request a new one.');
  }

  await user.setPassword(password);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save({ validateModifiedOnly: true });

  res.json({ message: 'Your password has been changed. You can log in now.' });
}
