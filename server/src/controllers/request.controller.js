import { BloodRequest, Facility, nextSequence } from '../models/index.js';
import { statusCounts, transitionRequest } from '../services/request.service.js';
import { ApiError } from '../utils/ApiError.js';
import { containsInsensitive, getPagination, paginated } from '../utils/helpers.js';
import { createRequestSchema } from '../validators/request.schemas.js';

const BANK_FIELDS = 'name address city phone openingHours';

export async function createRequest(req, res) {
  const user = req.user;
  const data = createRequestSchema(user.role).parse(req.body ?? {});

  const bank = await Facility.findOne({ _id: data.bloodBank, type: 'bloodbank', 'verification.status': 'verified' });
  if (!bank) {
    throw ApiError.badRequest('Choose a verified blood bank.', { bloodBank: 'Choose a verified blood bank.' });
  }

  const isHospital = user.role === 'hospital';
  const request = await BloodRequest.create({
    code: `RS-${await nextSequence('bloodRequest')}`,
    requester: user._id,
    requesterRole: user.role,
    hospitalFacility: isHospital ? user.facility?._id : null,
    bloodBank: bank._id,
    patientName: data.patientName,
    patientAge: data.patientAge,
    bloodGroup: data.bloodGroup,
    units: data.units,
    urgency: data.urgency,
    hospitalName: data.hospitalName || (isHospital ? user.facility?.name : undefined),
    city: data.city || (isHospital ? user.facility?.city : user.city),
    contactPhone: data.contactPhone,
    requiredBy: data.requiredBy,
    notes: data.notes,
    history: [{ status: 'pending', note: `Sent to ${bank.name}`, by: user._id }],
  });

  await request.populate('bloodBank', BANK_FIELDS);
  res.status(201).json({ request, message: `Request ${request.code} has been sent to ${bank.name}.` });
}

export async function listMyRequests(req, res) {
  const { status, search } = req.valid.query;
  const pagination = getPagination(req.valid.query);
  const base = { requester: req.user._id };
  const filter = { ...base };
  if (status) filter.status = status;
  if (search) filter.$or = [{ code: containsInsensitive(search) }, { patientName: containsInsensitive(search) }];

  const [items, total, counts] = await Promise.all([
    BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('bloodBank', BANK_FIELDS),
    BloodRequest.countDocuments(filter),
    statusCounts(base),
  ]);

  res.json({ ...paginated(items, total, pagination), counts });
}

export async function getRequest(req, res) {
  const request = await BloodRequest.findById(req.valid.params.id)
    .populate('bloodBank', BANK_FIELDS)
    .populate('requester', 'name email phone role')
    .populate('donorResponses.donor', 'name phone city donor.bloodGroup')
    .populate('history.by', 'name role');

  const user = req.user;
  const isAdmin = user.role === 'admin';
  const isRequester = Boolean(request?.requester?._id?.equals(user._id));
  const isBank = Boolean(
    user.role === 'bloodbank' && user.facility && request?.bloodBank?._id?.equals(user.facility._id),
  );

  if (!request || (!isAdmin && !isRequester && !isBank)) throw ApiError.notFound('Request not found.');

  res.json({ request, viewer: { isAdmin, isRequester, isBank } });
}

export async function cancelRequest(req, res) {
  const { id } = req.valid.params;
  const request = await transitionRequest({
    id,
    filter: { requester: req.user._id },
    from: ['pending'],
    to: 'cancelled',
    note: 'Cancelled by the requester',
    by: req.user._id,
  });

  if (!request) {
    const exists = await BloodRequest.exists({ _id: id, requester: req.user._id });
    throw exists
      ? ApiError.conflict('Only pending requests can be cancelled.')
      : ApiError.notFound('Request not found.');
  }

  res.json({ request, message: `${request.code} has been cancelled.` });
}
