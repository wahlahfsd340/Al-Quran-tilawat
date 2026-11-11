import mongoose from 'mongoose';

const cacheSchema = new mongoose.Schema({
  key: { type: String, unique: true, index: true },
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // 30 din
});

export const Cache = mongoose.model('Cache', cacheSchema);

const statSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  count: { type: Number, default: 0 },
});

export const Stat = mongoose.model('Stat', statSchema);
