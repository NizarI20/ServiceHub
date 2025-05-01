import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
