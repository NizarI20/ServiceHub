import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  titre: String,
  description: String,
  prix: Number,
  disponibilite: { type: Boolean, default: true },
  condition: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  featuredimg: {  type: String, default: 'https://example.com/default-image.jpg' },
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
