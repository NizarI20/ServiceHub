// routes/reservationRoutes.js
import express from 'express';
import { getSellerReservations, getClientReservations, getReservation, updateReservationStatus } from '../controllers/ReservationController.js';
// import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
// router.use(authenticateUser);

// Get all reservations for the authenticated seller
router.get('/seller', getSellerReservations);

// Get all reservations for the authenticated client
router.get('/client', getClientReservations);

// Get a specific reservation by ID
router.get('/:id', getReservation);

// Update a reservation's status
router.patch('/:id/status', updateReservationStatus);

export default router;
