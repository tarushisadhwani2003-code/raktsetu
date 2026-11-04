import mongoose from 'mongoose';
import { BLOOD_GROUPS, STOCK_REASONS } from '../utils/constants.js';

const { Schema } = mongoose;

/** Audit trail: every change to a blood bank's stock is recorded here. */
const stockMovementSchema = new Schema(
  {
    bloodBank: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    change: { type: Number, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    reason: { type: String, enum: STOCK_REASONS, required: true },
    note: { type: String, trim: true, maxlength: 200, default: '' },
    request: { type: Schema.Types.ObjectId, ref: 'BloodRequest' },
    donation: { type: Schema.Types.ObjectId, ref: 'Donation' },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

stockMovementSchema.index({ bloodBank: 1, createdAt: -1 });

export const StockMovement = mongoose.models.StockMovement || mongoose.model('StockMovement', stockMovementSchema);
