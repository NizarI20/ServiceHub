import api from '../lib/api.ts';

export const createReservation = (serviceId: string, date: string) =>
  api.post('/reservations', { serviceId, date });

export const confirmReservation = (reservationId: string) =>
  api.patch(`/reservations/${reservationId}/confirm`);

export const cancelReservation = (reservationId: string) =>
  api.patch(`/reservations/${reservationId}/cancel`);

export const fetchSellerReservations = () =>
  api.get('/reservations/seller');