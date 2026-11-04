import { DONATION_INTERVAL_DAYS, DONOR_AGE, MIN_DONOR_WEIGHT_KG } from './constants.js';

/**
 * Quick self-check used on the "Donate" page. It mirrors the main NBTC criteria;
 * the blood bank's medical team always makes the final decision.
 */
export function quickEligibilityCheck({ age, weight, gender, lastDonation }) {
  const problems = [];
  const ageValue = Number(age);
  const weightValue = Number(weight);

  if (!ageValue || ageValue < DONOR_AGE.min)
    problems.push(`You need to be at least ${DONOR_AGE.min} years old to donate.`);
  else if (ageValue > DONOR_AGE.max) problems.push(`Donors over ${DONOR_AGE.max} are usually not accepted.`);

  if (!weightValue || weightValue < MIN_DONOR_WEIGHT_KG)
    problems.push(`You need to weigh at least ${MIN_DONOR_WEIGHT_KG} kg.`);

  // The date from which the person can donate again, if that is still in the future.
  let waitUntil = null;
  if (lastDonation) {
    const interval = DONATION_INTERVAL_DAYS[gender] ?? DONATION_INTERVAL_DAYS.other;
    const nextDate = new Date(lastDonation);
    nextDate.setDate(nextDate.getDate() + interval);
    if (nextDate > new Date()) {
      waitUntil = nextDate;
      problems.push(`Wait ${interval} days between donations.`);
    }
  }

  return { eligible: problems.length === 0, problems, waitUntil };
}
