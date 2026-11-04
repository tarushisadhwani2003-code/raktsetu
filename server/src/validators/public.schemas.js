import { z } from 'zod';
import { bloodGroupQuery, email, emptyToUndefined, name, phone, queryBoolean, text } from './common.js';

export const bloodBanksQuery = z.object({
  city: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()),
  bloodGroup: bloodGroupQuery,
  inStock: queryBoolean,
});

export const contactSchema = z.object({
  name,
  email,
  phone: z.preprocess(emptyToUndefined, phone.optional()),
  subject: text('Subject', { min: 3, max: 120 }),
  message: text('Message', { min: 10, max: 2000 }),
});
