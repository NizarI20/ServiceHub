import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: String,
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);
