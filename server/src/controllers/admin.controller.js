import { BloodRequest, ContactMessage, Donation, Facility, User } from '../models/index.js';
import { deleteUserAccount } from '../services/account.service.js';
import { sendMail } from '../services/mailer.js';
import { statusCounts } from '../services/request.service.js';
import { ApiError } from '../utils/ApiError.js';
import { BLOOD_GROUPS, ROLES, emptyInventory } from '../utils/constants.js';
import { containsInsensitive, getPagination, lastMonths, paginated } from '../utils/helpers.js';

const countBy = (rows, keys) => {
  const counts = Object.fromEntries(keys.map((key) => [key, 0]));
  for (const row of rows) if (row._id in counts) counts[row._id] = row.count;
  return counts;
};

async function monthlyActivity() {
  const { months, since, timezone } = lastMonths(6);
  const monthOf = (field) => ({ $dateToString: { format: '%Y-%m', date: field, timezone } });

  const [requests, donations] = await Promise.all([
    BloodRequest.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: monthOf('$createdAt'), count: { $sum: 1 } } },
    ]),
    Donation.aggregate([
      { $match: { donatedAt: { $gte: since } } },
      { $group: { _id: monthOf('$donatedAt'), count: { $sum: 1 }, units: { $sum: '$units' } } },
    ]),
  ]);

  const requestsByMonth = Object.fromEntries(requests.map((row) => [row._id, row.count]));
  const donationsByMonth = Object.fromEntries(donations.map((row) => [row._id, row.units]));
  return months.map(({ key, label }) => ({
    month: label,
    requests: requestsByMonth[key] ?? 0,
    donatedUnits: donationsByMonth[key] ?? 0,
  }));
}

export async function getOverview(_req, res) {
  const [
    roles,
    facilities,
    requestCounts,
    donationTotals,
    newMessages,
    banks,
    donorGroups,
    monthly,
    pendingFacilities,
    recentRequests,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Facility.aggregate([{ $group: { _id: { type: '$type', status: '$verification.status' }, count: { $sum: 1 } } }]),
    statusCounts(),
    Donation.aggregate([{ $group: { _id: null, count: { $sum: 1 }, units: { $sum: '$units' } } }]),
    ContactMessage.countDocuments({ status: 'new' }),
    Facility.find({ type: 'bloodbank', 'verification.status': 'verified' }).select('inventory').lean(),
    User.aggregate([{ $match: { role: 'donor' } }, { $group: { _id: '$donor.bloodGroup', count: { $sum: 1 } } }]),
    monthlyActivity(),
    Facility.find({ 'verification.status': 'pending' })
      .sort({ createdAt: 1 })
      .limit(5)
      .populate('owner', 'name email phone'),
    BloodRequest.find().sort({ createdAt: -1 }).limit(6).populate('bloodBank', 'name city'),
  ]);

  const facilityCounts = {
    bloodbank: { pending: 0, verified: 0, rejected: 0 },
    hospital: { pending: 0, verified: 0, rejected: 0 },
  };
  for (const row of facilities) facilityCounts[row._id.type][row._id.status] = row.count;

  const stockByGroup = emptyInventory();
  for (const bank of banks) for (const group of BLOOD_GROUPS) stockByGroup[group] += bank.inventory?.[group] ?? 0;

  res.json({
    users: countBy(roles, ROLES),
    facilities: facilityCounts,
    requests: requestCounts,
    donations: { count: donationTotals[0]?.count ?? 0, units: donationTotals[0]?.units ?? 0 },
    newMessages,
    stockByGroup,
    donorsByGroup: countBy(donorGroups, BLOOD_GROUPS),
    monthly,
    pendingFacilities,
    recentRequests,
  });
}

export async function listUsers(req, res) {
  const { search, role, status } = req.valid.query;
  const pagination = getPagination(req.valid.query);

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.isActive = status === 'active';
  if (search) {
    const pattern = containsInsensitive(search);
    filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }, { city: pattern }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('facility', 'name type verification.status'),
    User.countDocuments(filter),
  ]);

  res.json(paginated(items, total, pagination));
}

async function findManageableUser(req) {
  const user = await User.findById(req.valid.params.id).populate('facility');
  if (!user) throw ApiError.notFound('User not found.');
  if (user._id.equals(req.user._id))
    throw ApiError.badRequest('You cannot change your own account here. Use your profile page.');
  if (user.role === 'admin') throw ApiError.forbidden('Admin accounts cannot be changed from this page.');
  return user;
}

export async function setUserStatus(req, res) {
  const user = await findManageableUser(req);
  user.isActive = req.valid.body.isActive;
  await user.save({ validateModifiedOnly: true });
  res.json({ user, message: `${user.name} is now ${user.isActive ? 'active' : 'suspended'}.` });
}

export async function deleteUser(req, res) {
  const user = await findManageableUser(req);
  await deleteUserAccount(user, { by: req.user._id, reason: 'The account was removed by an administrator.' });
  res.json({ message: `${user.name}'s account has been deleted.` });
}

export async function listFacilities(req, res) {
  const { search, status, type } = req.valid.query;
  const pagination = getPagination(req.valid.query);

  const filter = {};
  if (type) filter.type = type;
  if (status) filter['verification.status'] = status;
  if (search) {
    const pattern = containsInsensitive(search);
    filter.$or = [{ name: pattern }, { city: pattern }, { licenseNumber: pattern }];
  }

  const [items, total, statusRows] = await Promise.all([
    Facility.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('owner', 'name email phone'),
    Facility.countDocuments(filter),
    Facility.aggregate([
      { $match: type ? { type } : {} },
      { $group: { _id: '$verification.status', count: { $sum: 1 } } },
    ]),
  ]);

  const counts = countBy(statusRows, ['pending', 'verified', 'rejected']);
  counts.all = counts.pending + counts.verified + counts.rejected;
  res.json({ ...paginated(items, total, pagination), counts });
}

export async function reviewFacility(req, res) {
  const { status, note } = req.valid.body;
  const facility = await Facility.findById(req.valid.params.id).populate('owner', 'name email');
  if (!facility) throw ApiError.notFound('Facility not found.');

  facility.verification = { status, note, reviewedAt: new Date(), reviewedBy: req.user._id };
  await facility.save();

  if (status === 'rejected' && facility.type === 'bloodbank') {
    await BloodRequest.updateMany(
      { bloodBank: facility._id, status: 'pending' },
      {
        $set: { status: 'declined' },
        $push: {
          history: {
            status: 'declined',
            note: 'This blood bank is not verified on RaktSetu.',
            at: new Date(),
            by: req.user._id,
          },
        },
      },
    );
  }

  if (facility.owner?.email) {
    const approved = status === 'verified';
    await sendMail({
      to: facility.owner.email,
      subject: approved
        ? `${facility.name} is now verified on RaktSetu`
        : `Update on ${facility.name}'s RaktSetu verification`,
      text: approved
        ? `Hello ${facility.owner.name},\n\n${facility.name} has been verified. It is now visible on RaktSetu.\n\nThank you for joining the network.`
        : `Hello ${facility.owner.name},\n\nWe could not verify ${facility.name} yet.\nReason: ${note}\n\nPlease update your details or reply to this email.`,
    });
  }

  res.json({ facility, message: `${facility.name} has been ${status === 'verified' ? 'verified' : 'rejected'}.` });
}

export async function listRequests(req, res) {
  const { search, status, bloodGroup } = req.valid.query;
  const pagination = getPagination(req.valid.query);

  const filter = {};
  if (status) filter.status = status;
  if (bloodGroup) filter.bloodGroup = bloodGroup;
  if (search) {
    const pattern = containsInsensitive(search);
    filter.$or = [{ code: pattern }, { patientName: pattern }, { hospitalName: pattern }, { city: pattern }];
  }

  const [items, total, counts] = await Promise.all([
    BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('bloodBank', 'name city')
      .populate('requester', 'name role'),
    BloodRequest.countDocuments(filter),
    statusCounts(),
  ]);

  res.json({ ...paginated(items, total, pagination), counts });
}

export async function listMessages(req, res) {
  const { status } = req.valid.query;
  const pagination = getPagination(req.valid.query);
  const filter = status ? { status } : {};

  const [items, total, statusRows] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
    ContactMessage.countDocuments(filter),
    ContactMessage.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const counts = countBy(statusRows, ['new', 'read', 'resolved']);
  counts.all = counts.new + counts.read + counts.resolved;
  res.json({ ...paginated(items, total, pagination), counts });
}

export async function updateMessage(req, res) {
  const message = await ContactMessage.findByIdAndUpdate(
    req.valid.params.id,
    { $set: { status: req.valid.body.status } },
    { new: true },
  );
  if (!message) throw ApiError.notFound('Message not found.');
  res.json({ item: message, message: `Marked as ${message.status}.` });
}

export async function deleteMessage(req, res) {
  const message = await ContactMessage.findByIdAndDelete(req.valid.params.id);
  if (!message) throw ApiError.notFound('Message not found.');
  res.json({ message: 'Message deleted.' });
}
