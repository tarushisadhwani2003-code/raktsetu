export {
  BLOOD_GROUPS,
  COMPATIBLE_DONORS,
  recipientsFor,
  totalInventory,
  DONATION_INTERVAL_DAYS,
  DONOR_AGE,
  MIN_DONOR_WEIGHT_KG,
} from '../../../shared/domain.js';

export const ROLE_LABELS = {
  seeker: 'Patient / family',
  donor: 'Donor',
  hospital: 'Hospital',
  bloodbank: 'Blood bank',
  admin: 'Admin',
};

export const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

/** Badge tone and label for every status shown in the app. */
export const REQUEST_STATUS = {
  pending: { label: 'Pending', tone: 'amber' },
  approved: { label: 'Approved', tone: 'blue' },
  fulfilled: { label: 'Handed over', tone: 'green' },
  declined: { label: 'Declined', tone: 'red' },
  cancelled: { label: 'Cancelled', tone: 'gray' },
};

export const URGENCY = {
  normal: { label: 'Normal', tone: 'gray' },
  urgent: { label: 'Urgent', tone: 'amber' },
  critical: { label: 'Critical', tone: 'red' },
};

export const VERIFICATION = {
  pending: { label: 'Awaiting verification', tone: 'amber' },
  verified: { label: 'Verified', tone: 'green' },
  rejected: { label: 'Not verified', tone: 'red' },
};

export const MESSAGE_STATUS = {
  new: { label: 'New', tone: 'brand' },
  read: { label: 'Read', tone: 'gray' },
  resolved: { label: 'Resolved', tone: 'green' },
};

export const LOW_STOCK_THRESHOLD = 10;

export const stockLevel = (units = 0) => (units <= 0 ? 'out' : units < LOW_STOCK_THRESHOLD ? 'low' : 'ok');

export const STOCK_LEVEL = {
  ok: { label: 'In stock', tone: 'green' },
  low: { label: 'Low stock', tone: 'amber' },
  out: { label: 'Out of stock', tone: 'red' },
};

export const STOCK_REASONS = {
  donation: 'Donation',
  request: 'Blood request',
  received: 'Received',
  expired: 'Expired',
  adjustment: 'Correction',
};
