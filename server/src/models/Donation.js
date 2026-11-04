import mongoose from 'mongoose';
import { BLOOD_GROUPS } from '../utils/constants.js';

const { Schema } = mongoose;

/** A blood donation recorded by a blood bank. `donor` is empty for walk-in donors without an account. */
const donationSchema = new Schema(
  {
    donor: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    donorName: { type: String, required: true, trim: true, maxlength: 80 },
    donorPhone: { type: String, trim: true, default: '' },
    bloodBank: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    units: { type: Number, required: true, min: 1, max: 2, default: 1 },
    donatedAt: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

export const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
