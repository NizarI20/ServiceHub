import { CronJob } from 'cron';
import Reservation from '../models/Reservation.js';
import { sendReservationReminder } from './emailService.js';

/**
 * Fonction qui envoie des rappels pour les réservations prévues dans les 24 heures
 */
export const sendDailyReminderEmails = async () => {
  try {
    console.log('Envoi des rappels de réservations...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Définir l'intervalle pour trouver les réservations de demain
    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);
    
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    
    // Rechercher toutes les réservations confirmées pour demain
    const reservations = await Reservation.find({
      status: 'confirmed',
      startDate: { $gte: startOfTomorrow, $lte: endOfTomorrow }
    }).populate('client').populate('service');
    
    console.log(`${reservations.length} réservations trouvées pour demain`);
    
    // Envoyer un rappel pour chaque réservation
    for (const reservation of reservations) {
      try {
        await sendReservationReminder(
          reservation.client,
          reservation.service,
          reservation.startDate
        );
        console.log(`Rappel envoyé pour la réservation ${reservation._id}`);
      } catch (error) {
        console.error(`Échec de l'envoi du rappel pour la réservation ${reservation._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels de réservation:', error);
  }
};

/**
 * Initialiser les tâches planifiées
 */
export const initScheduledTasks = () => {
  // Exécuter tous les jours à 9h00
  const reminderJob = new CronJob('0 9 * * *', sendDailyReminderEmails, null, false, 'Europe/Paris');
  reminderJob.start();
  console.log('Tâches planifiées initialisées');
}; 