import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, required: true },
});

export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const SEQUENCE_START = 1000;

/** Atomically get the next number in a named sequence: 1001, 1002, ... */
export async function nextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: false },
  );
  return SEQUENCE_START + counter.seq;
}
