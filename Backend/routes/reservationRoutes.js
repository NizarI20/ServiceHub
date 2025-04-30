import express from 'express';
import {
  createReservation,
  confirmReservation,
  cancelReservation,
  getSellerReservations,
} from '../controllers/ReservationController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Toutes les routes protégées
router.use(authMiddleware);

// Créer une réservation
router.post('/', createReservation);

// Valider une réservation
router.patch('/:id/confirm', confirmReservation);

// Refuser une réservation
router.patch('/:id/cancel', cancelReservation);

// Récupérer les réservations du vendeur
router.get('/seller', getSellerReservations);

export default router;