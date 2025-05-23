import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  titre: String,
  description: String,
  prix: Number,
  disponibilite: { type: Boolean, default: true },
  condition: String,
  categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
<<<<<<< HEAD
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  featuredimg: {  type: String, default: 'https://example.com/default-image.jpg' },
=======
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  featuredimg: {  type: String, default: 'https://idweek.org/wp-content/uploads/2021/02/placeholder.png' },
>>>>>>> 2b6844ffb6702a912e5a64a623ad5d08937365f5
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
