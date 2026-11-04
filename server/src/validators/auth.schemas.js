import { z } from 'zod';
import { GENDERS, SELF_SERVICE_ROLES } from '../utils/constants.js';
import { ageOn } from '../utils/helpers.js';
import { DONOR_AGE, MIN_DONOR_WEIGHT_KG } from '../utils/eligibility.js';
import {
  bloodGroup,
  city,
  date,
  email,
  emptyToUndefined,
  mobile,
  name,
  optionalDate,
  optionalText,
  password,
  phone,
  pincode,
  state,
  text,
} from './common.js';

export const roleSchema = z.object({
  role: z.enum(SELF_SERVICE_ROLES, { error: 'Choose how you want to use RaktSetu.' }),
});

const account = {
  name,
  email,
  phone: mobile,
  password,
  city,
  state,
};

export const donorFields = {
  bloodGroup,
  gender: z.enum(GENDERS, { error: 'Choose a gender.' }),
  dateOfBirth: date('Enter your date of birth.').refine((value) => {
    const age = ageOn(value);
    return age >= DONOR_AGE.min && age <= DONOR_AGE.max;
  }, `Donors must be between ${DONOR_AGE.min} and ${DONOR_AGE.max} years old.`),
  weightKg: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: 'Enter your weight in kg.' })
      .min(MIN_DONOR_WEIGHT_KG, `Donors must weigh at least ${MIN_DONOR_WEIGHT_KG} kg.`)
      .max(250, 'Enter a realistic weight.'),
  ),
  lastDonationDate: optionalDate('Enter a valid date.').refine(
    (value) => !value || value <= new Date(),
    'The last donation date cannot be in the future.',
  ),
};

export const facilityFields = {
  facilityName: text('Facility name', { min: 3, max: 120 }),
  licenseNumber: text('Licence / registration number', { min: 3, max: 60 }),
  address: text('Address', { min: 5, max: 240 }),
  pincode,
  facilityPhone: z.preprocess((value) => (value === '' ? undefined : value), phone.optional()),
  openingHours: optionalText(80),
};

const withRole = (role, fields) => z.object({ role: z.literal(role), ...account, ...fields });

export const registerSchemas = {
  seeker: withRole('seeker', {}),
  donor: withRole('donor', donorFields),
  hospital: withRole('hospital', facilityFields),
  bloodbank: withRole('bloodbank', facilityFields),
};

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Enter your email or mobile number.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^[a-f\d]{64}$/i, 'This reset link is not valid.'),
  password,
});
