import mongoose from 'mongoose';

const avisSchema = new mongoose.Schema({
  commentaire: String,
  note: { type: Number, min: 1, max: 5 },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
}, { timestamps: true });

export default mongoose.model('Avis', avisSchema);
