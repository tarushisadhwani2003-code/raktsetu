import { BLOOD_GROUPS } from './constants.js';

/** "O+" arrives as "O " when the + is not encoded in a shared link. */
export const readBloodGroup = (value) => {
  const group = (value ?? '').replace(/ $/, '+').trim().toUpperCase();
  return BLOOD_GROUPS.includes(group) ? group : '';
};
