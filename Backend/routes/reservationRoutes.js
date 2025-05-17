// routes/reservationRoutes.js
import express from 'express';
import { getSellerReservations, getClientReservations, getReservation, updateReservationStatus, createReservation } from '../controllers/ReservationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create a new reservation
router.post('/', createReservation);

// Get all reservations for the authenticated seller
router.get('/seller', getSellerReservations);

// Get all reservations for the authenticated client
router.get('/client', getClientReservations);

// Get a specific reservation by ID
router.get('/:id', getReservation);

// Update a reservation's status
router.patch('/:id/status', updateReservationStatus);

// Confirm a reservation (sets status to 'confirmed')
router.patch('/:id/confirm', (req, res) => {
  req.body.status = 'confirmed';
  updateReservationStatus(req, res);
});

// Cancel a reservation (sets status to 'cancelled')
router.patch('/:id/cancel', (req, res) => {
  req.body.status = 'cancelled';
  updateReservationStatus(req, res);
});

export default router;
