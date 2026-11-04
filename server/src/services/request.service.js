import { BloodRequest } from '../models/index.js';
import { REQUEST_STATUSES } from '../utils/constants.js';

const URGENCY_RANK = { critical: 0, urgent: 1, normal: 2 };

/** Most urgent first, then oldest first (first come, first served). */
export const byUrgency = (a, b) =>
  URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || new Date(a.createdAt) - new Date(b.createdAt);

/** Number of requests per status for a filter, e.g. { pending: 2, approved: 1, ..., all: 5 }. */
export async function statusCounts(match = {}) {
  const rows = await BloodRequest.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  const counts = Object.fromEntries(REQUEST_STATUSES.map((status) => [status, 0]));
  for (const row of rows) counts[row._id] = row.count;
  counts.all = rows.reduce((sum, row) => sum + row.count, 0);
  return counts;
}

/**
 * Move a request from one of `from` statuses to `to`, atomically.
 * Returns the updated request, or null if it was not in an allowed status.
 */
export function transitionRequest({ id, filter = {}, from, to, note = '', by }) {
  return BloodRequest.findOneAndUpdate(
    { _id: id, ...filter, status: { $in: from } },
    { $set: { status: to }, $push: { history: { status: to, note, by, at: new Date() } } },
    { new: true },
  );
}
