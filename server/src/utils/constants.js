export { BLOOD_GROUPS, COMPATIBLE_DONORS, recipientsFor, emptyInventory } from '../../../shared/domain.js';

export const ROLES = ['seeker', 'donor', 'hospital', 'bloodbank', 'admin'];
export const SELF_SERVICE_ROLES = ['seeker', 'donor', 'hospital', 'bloodbank'];
export const FACILITY_ROLES = ['hospital', 'bloodbank'];
export const REQUESTER_ROLES = ['seeker', 'hospital'];

export const GENDERS = ['female', 'male', 'other'];
export const URGENCY_LEVELS = ['normal', 'urgent', 'critical'];
export const REQUEST_STATUSES = ['pending', 'approved', 'fulfilled', 'declined', 'cancelled'];
export const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'];
export const MESSAGE_STATUSES = ['new', 'read', 'resolved'];
export const STOCK_REASONS = ['donation', 'request', 'received', 'expired', 'adjustment'];
