import mongoose from 'mongoose';
import { MESSAGE_STATUSES } from '../utils/constants.js';

const { Schema } = mongoose;

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'new', index: true },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

export const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
