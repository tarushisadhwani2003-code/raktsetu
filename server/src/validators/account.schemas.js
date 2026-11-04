import { z } from 'zod';
import { FACILITY_ROLES } from '../utils/constants.js';
import { donorFields, facilityFields } from './auth.schemas.js';
import { city, date, email, mobile, name, password, state } from './common.js';

/**
 * Profile update schema for a role. Every field is optional:
 * the controller only applies the fields the client actually sent.
 */
export function updateAccountSchema(role) {
  const fields = { name, email, phone: mobile, city, state };
  if (role === 'donor') {
    Object.assign(fields, donorFields, {
      // The age limit is checked at sign-up and on every donation, not on profile edits.
      dateOfBirth: date('Enter your date of birth.').refine((value) => value < new Date(), 'Enter a date in the past.'),
      isAvailable: z.boolean(),
    });
  }
  if (FACILITY_ROLES.includes(role)) Object.assign(fields, facilityFields);
  return z.object(fields).partial();
}

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: password,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Enter your password to confirm.'),
});
