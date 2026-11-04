import { BloodRequest, Donation } from '../models/index.js';
import { byUrgency } from '../services/request.service.js';
import { ApiError } from '../utils/ApiError.js';
import { recipientsFor } from '../utils/constants.js';
import { donorEligibility } from '../utils/eligibility.js';
import { addDays, exactInsensitive, formatDate, startOfDay } from '../utils/helpers.js';

const OPEN_STATUSES = ['pending', 'approved'];
const BANK_FIELDS = 'name address city phone';

/** Open requests in the donor's city that their blood group can help with. */
function matchingFilter(user) {
  return {
    status: { $in: OPEN_STATUSES },
    bloodGroup: { $in: recipientsFor(user.donor.bloodGroup) },
    city: exactInsensitive(user.city),
    createdAt: { $gte: addDays(new Date(), -30) },
    $or: [{ requiredBy: null }, { requiredBy: { $gte: startOfDay() } }],
  };
}

/**
 * What a donor may see. Contact details are only shared after the donor offers to help.
 */
function toDonorView(request, donorId) {
  const responded = request.donorResponses.some((response) => response.donor.equals(donorId));
  return {
    _id: request._id,
    code: request.code,
    bloodGroup: request.bloodGroup,
    units: request.units,
    urgency: request.urgency,
    status: request.status,
    hospitalName: request.hospitalName,
    city: request.city,
    requiredBy: request.requiredBy,
    createdAt: request.createdAt,
    bloodBank: request.bloodBank,
    respondersCount: request.donorResponses.length,
    responded,
    ...(responded && {
      patientName: request.patientName,
      contactPhone: request.contactPhone,
      notes: request.notes,
    }),
  };
}

async function findMatchingRequests(user, limit = 50) {
  const requests = await BloodRequest.find(matchingFilter(user))
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('bloodBank', BANK_FIELDS);
  return requests.sort(byUrgency).map((request) => toDonorView(request, user._id));
}

export async function getOverview(req, res) {
  const user = req.user;
  const [totals, recentDonations, matchingRequests] = await Promise.all([
    Donation.aggregate([
      { $match: { donor: user._id } },
      { $group: { _id: null, count: { $sum: 1 }, units: { $sum: '$units' } } },
    ]),
    Donation.find({ donor: user._id }).sort({ donatedAt: -1 }).limit(5).populate('bloodBank', 'name city'),
    findMatchingRequests(user, 20),
  ]);

  res.json({
    eligibility: donorEligibility(user.donor),
    isAvailable: user.donor.isAvailable,
    stats: {
      donations: totals[0]?.count ?? 0,
      units: totals[0]?.units ?? 0,
      lastDonationDate: user.donor.lastDonationDate,
    },
    recentDonations,
    matchingRequests: matchingRequests.slice(0, 5),
    matchingCount: matchingRequests.length,
  });
}

export async function listMatchingRequests(req, res) {
  res.json({ items: await findMatchingRequests(req.user) });
}

export async function respondToRequest(req, res) {
  const user = req.user;
  const eligibility = donorEligibility(user.donor);

  if (!eligibility.eligible) {
    const next = eligibility.nextEligibleDate
      ? ` You can donate again from ${formatDate(eligibility.nextEligibleDate)}.`
      : '';
    throw ApiError.conflict(`You cannot donate right now.${next}`);
  }
  if (!user.donor.isAvailable) {
    throw ApiError.conflict('Turn on "Available to donate" in your profile to respond to requests.');
  }

  const filter = { _id: req.valid.params.id, ...matchingFilter(user) };
  const result = await BloodRequest.updateOne(
    { ...filter, 'donorResponses.donor': { $ne: user._id } },
    { $push: { donorResponses: { donor: user._id, respondedAt: new Date() } } },
  );

  const request = await BloodRequest.findOne(filter).populate('bloodBank', BANK_FIELDS);
  if (!request) throw ApiError.notFound('This request is no longer open.');

  res.json({
    request: toDonorView(request, user._id),
    message: result.modifiedCount
      ? 'Thank you! The family can now see your name and mobile number, and you can call them.'
      : 'You have already offered to help with this request.',
  });
}

export async function withdrawResponse(req, res) {
  const user = req.user;
  const request = await BloodRequest.findOneAndUpdate(
    { _id: req.valid.params.id },
    { $pull: { donorResponses: { donor: user._id } } },
    { new: true },
  ).populate('bloodBank', BANK_FIELDS);

  if (!request) throw ApiError.notFound('Request not found.');
  res.json({ request: toDonorView(request, user._id), message: 'Your offer to donate has been withdrawn.' });
}

export async function listDonations(req, res) {
  const items = await Donation.find({ donor: req.user._id })
    .sort({ donatedAt: -1 })
    .limit(200)
    .populate('bloodBank', 'name city');
  res.json({ items });
}
