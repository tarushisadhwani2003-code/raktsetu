import mongoose from 'mongoose';
import { BLOOD_GROUPS, REQUEST_STATUSES, URGENCY_LEVELS } from '../utils/constants.js';

const { Schema } = mongoose;

const historySchema = new Schema(
  {
    status: { type: String, enum: REQUEST_STATUSES, required: true },
    note: { type: String, trim: true, default: '' },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

const donorResponseSchema = new Schema(
  {
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    respondedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const bloodRequestSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requesterRole: { type: String, enum: ['seeker', 'hospital'], required: true },
    hospitalFacility: { type: Schema.Types.ObjectId, ref: 'Facility', default: null },
    bloodBank: { type: Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    patientName: { type: String, required: true, trim: true, maxlength: 80 },
    patientAge: { type: Number, min: 0, max: 120 },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    units: { type: Number, required: true, min: 1, max: 10 },
    urgency: { type: String, enum: URGENCY_LEVELS, default: 'normal' },
    hospitalName: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    requiredBy: { type: Date },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: REQUEST_STATUSES, default: 'pending', index: true },
    history: { type: [historySchema], default: [] },
    donorResponses: { type: [donorResponseSchema], default: [] },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

bloodRequestSchema.index({ bloodBank: 1, status: 1, createdAt: -1 });
bloodRequestSchema.index({ city: 1, bloodGroup: 1, status: 1 });

export const BloodRequest = mongoose.models.BloodRequest || mongoose.model('BloodRequest', bloodRequestSchema);
