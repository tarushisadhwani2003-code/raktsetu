import { z } from 'zod';
import { BLOOD_GROUPS, MESSAGE_STATUSES, REQUEST_STATUSES, ROLES, VERIFICATION_STATUSES } from '../utils/constants.js';
import { optionalEnum, optionalText, pageQuery, search } from './common.js';

export const usersQuery = z.object({
  search,
  role: optionalEnum(ROLES),
  status: optionalEnum(['active', 'suspended']),
  ...pageQuery,
});

export const userStatusSchema = z.object({
  isActive: z.boolean({ error: 'Choose active or suspended.' }),
});

export const facilitiesQuery = z.object({
  search,
  status: optionalEnum(VERIFICATION_STATUSES),
  type: optionalEnum(['hospital', 'bloodbank']),
  ...pageQuery,
});

export const reviewFacilitySchema = z
  .object({
    status: z.enum(['verified', 'rejected'], { error: 'Choose approve or reject.' }),
    note: optionalText(300),
  })
  .refine((data) => data.status !== 'rejected' || data.note.length >= 3, {
    path: ['note'],
    message: 'Tell the facility why it was rejected.',
  });

export const adminRequestsQuery = z.object({
  search,
  status: optionalEnum(REQUEST_STATUSES),
  bloodGroup: optionalEnum(BLOOD_GROUPS),
  ...pageQuery,
});

export const messagesQuery = z.object({
  status: optionalEnum(MESSAGE_STATUSES),
  ...pageQuery,
});

export const messageStatusSchema = z.object({
  status: z.enum(MESSAGE_STATUSES),
});
