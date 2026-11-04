import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { BLOOD_GROUPS, GENDERS, ROLES } from '../utils/constants.js';
import { donorEligibility } from '../utils/eligibility.js';

const { Schema } = mongoose;

const donorProfileSchema = new Schema(
  {
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    gender: { type: String, enum: GENDERS, required: true },
    dateOfBirth: { type: Date, required: true },
    weightKg: { type: Number, min: 30, max: 250 },
    lastDonationDate: { type: Date, default: null },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, index: true },
    isActive: { type: Boolean, default: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: '' },
    donor: { type: donorProfileSchema, default: undefined },
    facility: { type: Schema.Types.ObjectId, ref: 'Facility', default: null },
    passwordChangedAt: { type: Date },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        delete ret.id;
        delete ret.passwordHash;
        delete ret.resetPasswordTokenHash;
        delete ret.resetPasswordExpiresAt;
        return ret;
      },
    },
  },
);

userSchema.index({ role: 1, 'donor.bloodGroup': 1, city: 1 });

userSchema.virtual('eligibility').get(function eligibility() {
  return this.role === 'donor' && this.donor ? donorEligibility(this.donor) : undefined;
});

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 12);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
  this.passwordChangedAt = new Date();
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
