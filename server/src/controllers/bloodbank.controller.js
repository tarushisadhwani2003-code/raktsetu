import { BloodRequest, Donation, Facility, StockMovement, User } from '../models/index.js';
import { byUrgency, statusCounts, transitionRequest } from '../services/request.service.js';
import { changeStock } from '../services/stock.service.js';
import { ApiError } from '../utils/ApiError.js';
import { emptyInventory } from '../utils/constants.js';
import { donorEligibility } from '../utils/eligibility.js';
import {
  containsInsensitive,
  formatDate,
  getPagination,
  lastMonths,
  normaliseMobile,
  paginated,
} from '../utils/helpers.js';

const bankIdOf = (req) => req.user.facility._id;

export async function getOverview(req, res) {
  const bankId = bankIdOf(req);
  const { since } = lastMonths(1);

  const [facility, counts, pending, movements, monthDonations] = await Promise.all([
    Facility.findById(bankId),
    statusCounts({ bloodBank: bankId }),
    BloodRequest.find({ bloodBank: bankId, status: 'pending' }).limit(50).populate('requester', 'name role'),
    StockMovement.find({ bloodBank: bankId }).sort({ createdAt: -1 }).limit(8).populate('by', 'name'),
    Donation.aggregate([
      { $match: { bloodBank: bankId, donatedAt: { $gte: since } } },
      { $group: { _id: null, count: { $sum: 1 }, units: { $sum: '$units' } } },
    ]),
  ]);

  res.json({
    facility,
    inventory: facility.inventory ?? emptyInventory(),
    counts,
    pendingRequests: pending.sort(byUrgency).slice(0, 6),
    recentMovements: movements,
    donationsThisMonth: { count: monthDonations[0]?.count ?? 0, units: monthDonations[0]?.units ?? 0 },
  });
}

export async function listRequests(req, res) {
  const bankId = bankIdOf(req);
  const { status, search } = req.valid.query;
  const pagination = getPagination(req.valid.query);

  const filter = { bloodBank: bankId };
  if (status) filter.status = status;
  if (search) {
    const pattern = containsInsensitive(search);
    filter.$or = [{ code: pattern }, { patientName: pattern }, { hospitalName: pattern }];
  }

  const [items, total, counts] = await Promise.all([
    BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('requester', 'name role phone'),
    BloodRequest.countDocuments(filter),
    statusCounts({ bloodBank: bankId }),
  ]);

  res.json({ ...paginated(items, total, pagination), counts });
}

export async function updateRequestStatus(req, res) {
  const bankId = bankIdOf(req);
  const { id } = req.valid.params;
  const { action, note } = req.valid.body;
  const by = req.user._id;

  const request = await BloodRequest.findOne({ _id: id, bloodBank: bankId });
  if (!request) throw ApiError.notFound('Request not found.');

  const stale = () => ApiError.conflict('This request was changed in the meantime. Refresh the page and try again.');
  let updated;
  let message;

  if (action === 'approve') {
    if (request.status !== 'pending') throw ApiError.conflict('Only pending requests can be approved.');
    updated = await transitionRequest({
      id,
      from: ['pending'],
      to: 'approved',
      note: note || `${request.units} unit(s) of ${request.bloodGroup} reserved for the patient.`,
      by,
    });
    if (!updated) throw stale();

    try {
      await changeStock({
        bankId,
        bloodGroup: request.bloodGroup,
        change: -request.units,
        reason: 'request',
        note: `Issued for ${request.code}`,
        by,
        request: request._id,
      });
    } catch (error) {
      // Not enough stock: put the request back to pending.
      await BloodRequest.updateOne({ _id: id }, { $set: { status: 'pending' }, $pop: { history: 1 } });
      throw error;
    }
    message = `${request.code} approved. ${request.units} unit(s) of ${request.bloodGroup} taken from stock.`;
  }

  if (action === 'fulfill') {
    if (request.status !== 'approved') throw ApiError.conflict('Approve the request before marking it as handed over.');
    updated = await transitionRequest({
      id,
      from: ['approved'],
      to: 'fulfilled',
      note: note || 'Blood handed over.',
      by,
    });
    if (!updated) throw stale();
    message = `${request.code} marked as handed over.`;
  }

  if (action === 'decline') {
    if (!['pending', 'approved'].includes(request.status)) {
      throw ApiError.conflict('Only pending or approved requests can be declined.');
    }
    updated = await transitionRequest({ id, from: [request.status], to: 'declined', note, by });
    if (!updated) throw stale();

    if (request.status === 'approved') {
      await changeStock({
        bankId,
        bloodGroup: request.bloodGroup,
        change: request.units,
        reason: 'request',
        note: `Returned to stock — ${request.code} declined`,
        by,
        request: request._id,
      });
    }
    message = `${request.code} declined.`;
  }

  await updated.populate('requester', 'name role phone');
  res.json({ request: updated, message });
}

export async function getInventory(req, res) {
  const bankId = bankIdOf(req);
  const [facility, movements] = await Promise.all([
    Facility.findById(bankId).select('inventory inventoryUpdatedAt'),
    StockMovement.find({ bloodBank: bankId }).sort({ createdAt: -1 }).limit(50).populate('by', 'name'),
  ]);

  res.json({
    inventory: facility.inventory ?? emptyInventory(),
    inventoryUpdatedAt: facility.inventoryUpdatedAt ?? null,
    movements,
  });
}

export async function adjustStock(req, res) {
  const { bloodGroup, change, reason, note } = req.valid.body;

  if (reason === 'received' && change < 0) {
    throw ApiError.badRequest('Received stock must be added, not removed.', {
      change: 'Use "Add units" for received stock.',
    });
  }
  if (reason === 'expired' && change > 0) {
    throw ApiError.badRequest('Expired units can only be removed.', {
      change: 'Use "Remove units" for expired stock.',
    });
  }

  const { bank, movement } = await changeStock({
    bankId: bankIdOf(req),
    bloodGroup,
    change,
    reason,
    note,
    by: req.user._id,
  });

  const verb = change > 0 ? 'added to' : 'removed from';
  res.json({
    inventory: bank.inventory,
    inventoryUpdatedAt: bank.inventoryUpdatedAt,
    movement,
    message: `${Math.abs(change)} unit(s) ${verb} ${bloodGroup} stock.`,
  });
}

const donorSummary = (user) => ({
  _id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  city: user.city,
  bloodGroup: user.donor.bloodGroup,
  gender: user.donor.gender,
  lastDonationDate: user.donor.lastDonationDate,
  eligibility: donorEligibility(user.donor),
});

export async function lookupDonor(req, res) {
  const { q } = req.valid.query;
  const query = q.includes('@') ? { email: q.toLowerCase() } : { phone: normaliseMobile(q) };
  const donor = await User.findOne({ ...query, role: 'donor', isActive: true });
  res.json({ donor: donor ? donorSummary(donor) : null });
}

export async function recordDonation(req, res) {
  const bankId = bankIdOf(req);
  const data = req.valid.body;
  const donatedAt = data.donatedAt ?? new Date();

  let donor = null;
  let bloodGroup = data.bloodGroup;

  if (data.donorId) {
    donor = await User.findOne({ _id: data.donorId, role: 'donor' });
    if (!donor) throw ApiError.notFound('Donor not found.');
    bloodGroup = donor.donor.bloodGroup;

    const eligibility = donorEligibility(donor.donor, donatedAt);
    if (!eligibility.eligible) {
      const next = eligibility.nextEligibleDate ? ` Next eligible on ${formatDate(eligibility.nextEligibleDate)}.` : '';
      throw ApiError.conflict(`${donor.name} cannot donate yet. ${eligibility.reasons.join(' ')}${next}`);
    }
  }

  const donation = await Donation.create({
    donor: donor?._id ?? null,
    donorName: donor?.name ?? data.donorName,
    donorPhone: donor?.phone ?? data.donorPhone ?? '',
    bloodBank: bankId,
    bloodGroup,
    units: data.units,
    donatedAt,
    notes: data.notes,
    recordedBy: req.user._id,
  });

  try {
    await changeStock({
      bankId,
      bloodGroup,
      change: data.units,
      reason: 'donation',
      note: `Donation by ${donation.donorName}`,
      by: req.user._id,
      donation: donation._id,
    });
  } catch (error) {
    await Donation.deleteOne({ _id: donation._id });
    throw error;
  }

  if (donor && (!donor.donor.lastDonationDate || donatedAt > donor.donor.lastDonationDate)) {
    donor.donor.lastDonationDate = donatedAt;
    await donor.save({ validateModifiedOnly: true });
  }

  res.status(201).json({
    donation,
    message: `Donation recorded. ${data.units} unit(s) of ${bloodGroup} added to stock.`,
  });
}

export async function listDonations(req, res) {
  const pagination = getPagination(req.valid.query);
  const filter = { bloodBank: bankIdOf(req) };
  const [items, total] = await Promise.all([
    Donation.find(filter).sort({ donatedAt: -1 }).skip(pagination.skip).limit(pagination.limit),
    Donation.countDocuments(filter),
  ]);
  res.json(paginated(items, total, pagination));
}
