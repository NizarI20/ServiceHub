import api from '../lib/api.ts';

interface ReservationData {
  serviceId: string;
  startDate: string;
  endDate: string;
}

/**
 * Crée une nouvelle réservation pour un service
 */
export const createReservation = (data: ReservationData) =>
  api.post('/reservations', data);

/**
 * Confirme une réservation (vendeur uniquement)
 */
export const confirmReservation = (reservationId: string) =>
  api.patch(`/reservations/${reservationId}/confirm`);

/**
 * Annule/refuse une réservation (vendeur uniquement)
 */
export const cancelReservation = (reservationId: string) =>
  api.patch(`/reservations/${reservationId}/cancel`);

/**
 * Récupère les réservations pour les services du vendeur connecté
 */
export const fetchSellerReservations = () =>
  api.get('/reservations/seller');

/**
 * Récupère les réservations faites par l'utilisateur connecté (acheteur)
 */
export const fetchUserReservations = () =>
  api.get('/reservations/user');