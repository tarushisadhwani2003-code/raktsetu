import { z } from 'zod';
import { bloodGroup, emptyToUndefined, mobile, objectId, optionalDate, optionalText, pageQuery } from './common.js';

export const adjustStockSchema = z.object({
  bloodGroup,
  change: z.coerce
    .number({ error: 'Enter the number of units.' })
    .int('Use whole units.')
    .refine((value) => value !== 0, 'Enter a number other than 0.')
    .refine((value) => Math.abs(value) <= 500, 'Adjust at most 500 units at a time.'),
  reason: z.enum(['received', 'expired', 'adjustment'], { error: 'Choose a reason.' }),
  note: optionalText(200),
});

export const donorLookupQuery = z.object({
  q: z.string().trim().min(3, 'Enter a mobile number or email.').max(100),
});

export const recordDonationSchema = z
  .object({
    donorId: z.preprocess(emptyToUndefined, objectId.optional()),
    donorName: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
    donorPhone: z.preprocess(emptyToUndefined, mobile.optional()),
    bloodGroup: z.preprocess(emptyToUndefined, bloodGroup.optional()),
    units: z.coerce.number().int().min(1, 'At least 1 unit.').max(2, 'At most 2 units per donation.').default(1),
    donatedAt: optionalDate().refine(
      (value) => !value || value <= new Date(),
      'The donation date cannot be in the future.',
    ),
    notes: optionalText(300),
  })
  .superRefine((data, ctx) => {
    if (data.donorId) return;
    if (!data.donorName || data.donorName.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['donorName'], message: "Enter the donor's name." });
    }
    if (!data.bloodGroup) {
      ctx.addIssue({ code: 'custom', path: ['bloodGroup'], message: 'Choose a blood group.' });
    }
  });

export const listQuery = z.object({ ...pageQuery });
