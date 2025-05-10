import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  titre: String,
  description: String,
  prix: Number,
  disponibilite: { type: Boolean, default: true },
  condition: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  featuredimg: {  type: String, default: 'https://idweek.org/wp-content/uploads/2021/02/placeholder.png' },
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
