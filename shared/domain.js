/** Domain values used by both the API and website. Keep this module browser-safe. */
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/** Red-cell compatibility: recipient group -> donor groups it can receive from. */
export const COMPATIBLE_DONORS = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': [...BLOOD_GROUPS],
};

export const recipientsFor = (donorGroup) =>
  BLOOD_GROUPS.filter((recipient) => COMPATIBLE_DONORS[recipient].includes(donorGroup));

export const emptyInventory = () => Object.fromEntries(BLOOD_GROUPS.map((group) => [group, 0]));
export const totalInventory = (inventory = {}) =>
  BLOOD_GROUPS.reduce((total, group) => total + (inventory[group] ?? 0), 0);

/** Existing whole-blood screening thresholds; medical staff make the final decision. */
export const DONATION_INTERVAL_DAYS = { male: 90, female: 120, other: 120 };
export const DONOR_AGE = { min: 18, max: 65 };
export const MIN_DONOR_WEIGHT_KG = 45;
