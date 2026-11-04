import { z } from 'zod';
import { BLOOD_GROUPS } from '../utils/constants.js';
import { toTitleCase } from '../utils/helpers.js';

// Friendlier message when a required field is missing.
z.config({
  customError: (issue) => {
    if (issue.code === 'invalid_type' && (issue.input === undefined || issue.input === null)) {
      return 'This field is required.';
    }
    return undefined;
  },
});

export const emptyToUndefined = (value) => (value === '' || value === null ? undefined : value);

export const text = (label, { min = 2, max = 120 } = {}) =>
  z
    .string()
    .trim()
    .min(min, min <= 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const optionalText = (max = 500) =>
  z.string().trim().max(max, `Keep this under ${max} characters.`).optional().default('');

export const name = text('Name', { min: 2, max: 80 });

export const email = z.string().trim().toLowerCase().email('Enter a valid email address.');

/** Indian mobile number; accepts +91 / 0 prefixes and spaces, stores 10 digits. */
export const mobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'));

/** Any phone number, including landlines like 0141-2560291. */
export const phone = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{8,16}$/, 'Enter a valid phone number.');

export const password = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(72, 'Use 72 characters or fewer.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/\d/, 'Include at least one number.');

export const city = text('City', { min: 2, max: 60 }).transform(toTitleCase);

export const state = z
  .string()
  .trim()
  .max(60)
  .optional()
  .default('')
  .transform((value) => (value ? toTitleCase(value) : ''));

export const pincode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter a 6-digit PIN code.');

export const bloodGroup = z.enum(BLOOD_GROUPS, { error: 'Choose a blood group.' });

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id.');

export const idParams = z.object({ id: objectId });

export const date = (message = 'Enter a valid date.') => z.coerce.date({ error: message });

export const optionalDate = (message) => z.preprocess(emptyToUndefined, date(message).optional());

export const optionalNumber = (schema) => z.preprocess(emptyToUndefined, schema.optional());

export const pageQuery = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
};

/** Query-string boolean: "true"/"1" -> true. */
export const queryBoolean = z
  .enum(['true', 'false', '1', '0'])
  .optional()
  .transform((value) => value === 'true' || value === '1');

/** Optional enum for query strings: an empty value means "no filter". */
export const optionalEnum = (values) => z.preprocess(emptyToUndefined, z.enum(values).optional());

/** Blood group in a query string. "O+" often arrives as "O " because "+" means space in URLs. */
export const bloodGroupQuery = z.preprocess(
  (value) => (typeof value === 'string' ? value.replace(/\s$/, '+').trim() || undefined : value),
  bloodGroup.optional(),
);

export const search = z.string().trim().max(80).optional();
