import { BloodRequest, Facility, User } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Permanently delete a user and tidy up what depends on them:
 * - their open blood requests are cancelled,
 * - requests waiting at their blood bank are declined,
 * - their facility (hospital / blood bank) is removed.
 * Donation records and stock history are kept for traceability.
 */
export async function deleteUserAccount(user, { by, reason = 'Account deleted' } = {}) {
  if (user.role === 'admin') {
    const otherAdmins = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: user._id } });
    if (otherAdmins === 0)
      throw ApiError.conflict('You are the only admin. Create another admin before deleting this account.');
  }

  const now = new Date();

  await BloodRequest.updateMany(
    { requester: user._id, status: 'pending' },
    { $set: { status: 'cancelled' }, $push: { history: { status: 'cancelled', note: reason, at: now, by } } },
  );

  const facilityId = user.facility?._id ?? user.facility;
  if (facilityId) {
    await BloodRequest.updateMany(
      { bloodBank: facilityId, status: 'pending' },
      {
        $set: { status: 'declined' },
        $push: { history: { status: 'declined', note: 'The blood bank is no longer on RaktSetu.', at: now, by } },
      },
    );
    await Facility.deleteOne({ _id: facilityId });
  }

  await BloodRequest.updateMany(
    { 'donorResponses.donor': user._id },
    { $pull: { donorResponses: { donor: user._id } } },
  );
  await User.deleteOne({ _id: user._id });
}
