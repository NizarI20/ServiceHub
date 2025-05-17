import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'], 
    default: 'pending' 
  },
  message: { 
    type: String, 
    trim: true,
    maxlength: 500 
  },
  alternativeDates: [
    {
      startDate: { type: Date },
      endDate: { type: Date },
      proposed: { type: Boolean, default: false }
    }
  ],
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
    createdAt: { type: Date }
  },
  notifications: [
    {
      type: { type: String, enum: ['confirmation', 'reminder', 'cancellation', 'reschedule'] },
      sentAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }
    }
  ],
  calendarEventIds: {
    google: { type: String },
    outlook: { type: String }
  }
}, { timestamps: true });

// Index pour améliorer les performances des requêtes
reservationSchema.index({ client: 1, startDate: -1 });
reservationSchema.index({ service: 1, startDate: -1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ startDate: 1 });

export default mongoose.model('Reservation', reservationSchema);
