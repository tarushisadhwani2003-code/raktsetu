import { addDays, ageOn, startOfDay } from './helpers.js';
import { DONATION_INTERVAL_DAYS, DONOR_AGE } from '../../../shared/domain.js';

export { DONATION_INTERVAL_DAYS, DONOR_AGE, MIN_DONOR_WEIGHT_KG } from '../../../shared/domain.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Work out whether a donor can donate on `onDate`.
 * Medical staff at the blood bank always make the final decision.
 */
export function donorEligibility(donor, onDate = new Date()) {
  if (!donor) return null;

  const intervalDays = DONATION_INTERVAL_DAYS[donor.gender] ?? DONATION_INTERVAL_DAYS.other;
  const age = donor.dateOfBirth ? ageOn(donor.dateOfBirth, onDate) : null;
  const ageOk = age === null || (age >= DONOR_AGE.min && age <= DONOR_AGE.max);

  const nextEligibleDate = donor.lastDonationDate ? addDays(startOfDay(donor.lastDonationDate), intervalDays) : null;
  const intervalOk = !nextEligibleDate || nextEligibleDate <= onDate;
  const daysRemaining = intervalOk ? 0 : Math.ceil((nextEligibleDate - startOfDay(onDate)) / DAY_MS);

  const reasons = [];
  if (!ageOk) reasons.push(`Donors must be between ${DONOR_AGE.min} and ${DONOR_AGE.max} years old.`);
  if (!intervalOk) {
    reasons.push(`A gap of ${intervalDays} days is needed between whole-blood donations.`);
  }

  return {
    eligible: ageOk && intervalOk,
    age,
    intervalDays,
    nextEligibleDate,
    daysRemaining,
    reasons,
  };
}
