import express from 'express';
import {
  createReservation,
  confirmReservation,
  cancelReservation,
  getSellerReservations,
  getUserReservations,
} from '../controllers/ReservationController.js';
import authMiddleware from '../middleswares/middleware.js';

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

// Récupérer les réservations de l'utilisateur (acheteur)
router.get('/user', getUserReservations);

export default router;