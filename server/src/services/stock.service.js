import { Facility, StockMovement } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Add (positive `change`) or remove (negative `change`) units of one blood group.
 * The update is atomic: stock can never drop below zero, even with simultaneous requests.
 * Every change is written to the StockMovement audit trail.
 */
export async function changeStock({ bankId, bloodGroup, change, reason, note = '', by, request, donation }) {
  if (!Number.isInteger(change) || change === 0) {
    throw ApiError.badRequest('Enter a whole number of units.');
  }

  const path = `inventory.${bloodGroup}`;
  const filter = { _id: bankId, type: 'bloodbank' };
  if (change < 0) filter[path] = { $gte: -change };

  const bank = await Facility.findOneAndUpdate(
    filter,
    { $inc: { [path]: change }, $set: { inventoryUpdatedAt: new Date() } },
    { new: true },
  );

  if (!bank) {
    const exists = await Facility.exists({ _id: bankId, type: 'bloodbank' });
    if (!exists) throw ApiError.notFound('Blood bank not found.');
    throw ApiError.conflict(`Not enough ${bloodGroup} units in stock.`);
  }

  const movement = await StockMovement.create({
    bloodBank: bankId,
    bloodGroup,
    change,
    balanceAfter: bank.inventory?.[bloodGroup] ?? 0,
    reason,
    note,
    request,
    donation,
    by,
  });

  return { bank, movement };
}
