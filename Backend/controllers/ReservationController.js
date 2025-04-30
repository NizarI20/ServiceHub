import Reservation from '../models/Reservation.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';

// Création d'une réservation (statut 'pending')
export const createReservation = async (req, res) => {
  const { serviceId, date } = req.body;
  const clientId = req.user._id;

  try {
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service introuvable.' });

    // Vérifier qu'il n'y a pas de conflit de date (optionnel)
    const existing = await Reservation.findOne({ service: serviceId, date });
    if (existing) return res.status(400).json({ message: 'Ce créneau est déjà réservé.' });

    const reservation = await Reservation.create({ client: clientId, service: serviceId, date });

    // Notification au vendeur
    await Notification.create({
      user: service.owner,
      message: `Nouvelle réservation pour \"${service.title}\" le ${new Date(date).toLocaleDateString()}`,
      reference: reservation._id,
    });

    return res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur interne.' });
  }
};

// Validation par le vendeur (statut 'confirmed')
export const confirmReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id).populate('service');
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (reservation.status !== 'pending') return res.status(400).json({ message: 'Statut non modifiable.' });

    reservation.status = 'confirmed';
    await reservation.save();

    // Notification au client
    await Notification.create({
      user: reservation.client,
      message: `Votre réservation pour \"${reservation.service.title}\" a été validée.`,
      reference: reservation._id,
    });

    return res.json(reservation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur interne.' });
  }
};

// Refus par le vendeur (statut 'cancelled')
export const cancelReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id).populate('service');
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (reservation.status !== 'pending') return res.status(400).json({ message: 'Statut non modifiable.' });

    reservation.status = 'cancelled';
    await reservation.save();

    // Notification au client
    await Notification.create({
      user: reservation.client,
      message: `Votre réservation pour \"${reservation.service.title}\" a été refusée.`,
      reference: reservation._id,
    });

    return res.json(reservation);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur interne.' });
  }
};

// Liste des réservations pour le vendeur - CORRIGER
export const getSellerReservations = async (req, res) => {
    try {
      const sellerId = req.user._id;
      
      // D'abord trouver les services appartenant au vendeur
      const sellerServices = await Service.find({ owner: sellerId });
      const serviceIds = sellerServices.map(service => service._id);
      
      // Ensuite trouver les réservations pour ces services
      const reservations = await Reservation.find({ service: { $in: serviceIds } })
        .populate('service')
        .populate('client', 'username email') // Limiter les champs client retournés
        .sort('-createdAt');
        
      return res.json(reservations);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur interne.' });
    }
  };