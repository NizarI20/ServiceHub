import api from '../lib/api.ts';

interface ReservationData {
  serviceId: string;
  startDate: string;
  endDate: string;
}

export const createReservation = (data: ReservationData) =>
  api.post('/reservations', data);

export const confirmReservation = (reservationId: string) =>
  api.patch(`/reservations/${reservationId}/confirm`);

export const cancelReservation = (reservationId: string) =>
  api.patch(`/reservations/${reservationId}/cancel`);

export const fetchSellerReservations = () =>
  api.get('/reservations/seller');

export const fetchUserReservations = () =>
  api.get('/reservations/user');