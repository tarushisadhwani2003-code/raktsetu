import mongoose from 'mongoose';
import { BLOOD_GROUPS, VERIFICATION_STATUSES } from '../utils/constants.js';

const { Schema } = mongoose;

const inventorySchema = new Schema(
  Object.fromEntries(BLOOD_GROUPS.map((group) => [group, { type: Number, default: 0, min: 0 }])),
  { _id: false },
);

/** A hospital or blood bank. Each facility is managed by one user account (the owner). */
const facilitySchema = new Schema(
  {
    type: { type: String, enum: ['hospital', 'bloodbank'], required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    licenseNumber: { type: String, required: true, trim: true, maxlength: 60 },
    address: { type: String, required: true, trim: true, maxlength: 240 },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    openingHours: { type: String, trim: true, default: 'Open 24 hours' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    verification: {
      status: { type: String, enum: VERIFICATION_STATUSES, default: 'pending', index: true },
      note: { type: String, trim: true, default: '' },
      reviewedAt: { type: Date },
      reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    inventory: { type: inventorySchema, default: undefined },
    inventoryUpdatedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        delete ret.id;
        return ret;
      },
    },
  },
);

facilitySchema.virtual('isVerified').get(function isVerified() {
  return this.verification?.status === 'verified';
});

export const Facility = mongoose.models.Facility || mongoose.model('Facility', facilitySchema);
