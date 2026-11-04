import { z } from 'zod';
import { REQUEST_STATUSES, URGENCY_LEVELS } from '../utils/constants.js';
import { startOfDay } from '../utils/helpers.js';
import {
  bloodGroup,
  city,
  emptyToUndefined,
  optionalDate,
  optionalEnum,
  optionalNumber,
  optionalText,
  pageQuery,
  phone,
  search,
  text,
} from './common.js';

const requestFields = {
  bloodBank: z.string({ error: 'Choose a blood bank.' }).regex(/^[a-f\d]{24}$/i, 'Choose a blood bank.'),
  patientName: text('Patient name', { min: 2, max: 80 }),
  patientAge: optionalNumber(z.coerce.number().int('Enter age in whole years.').min(0).max(120)),
  bloodGroup,
  units: z.coerce
    .number({ error: 'Enter the number of units.' })
    .int('Units must be a whole number.')
    .min(1, 'Request at least 1 unit.')
    .max(10, 'For more than 10 units, please call the blood bank directly.'),
  urgency: z.enum(URGENCY_LEVELS).default('normal'),
  contactPhone: phone,
  requiredBy: optionalDate().refine((value) => !value || value >= startOfDay(), 'Choose today or a later date.'),
  notes: optionalText(500),
};

/** Hospitals fill in their own name and city automatically; individuals must enter them. */
export const createRequestSchema = (role) =>
  z.object({
    ...requestFields,
    hospitalName:
      role === 'hospital'
        ? z.preprocess(emptyToUndefined, z.string().trim().max(120).optional())
        : text('Hospital name', { min: 2, max: 120 }),
    city: role === 'hospital' ? z.preprocess(emptyToUndefined, city.optional()) : city,
  });

export const requestListQuery = z.object({
  status: optionalEnum(REQUEST_STATUSES),
  search,
  ...pageQuery,
});

export const requestActionSchema = z
  .object({
    action: z.enum(['approve', 'decline', 'fulfill'], { error: 'Choose an action.' }),
    note: optionalText(300),
  })
  .refine((data) => data.action !== 'decline' || data.note.length >= 3, {
    path: ['note'],
    message: 'Please add a short reason so the requester knows what to do next.',
  });
