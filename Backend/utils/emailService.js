import nodemailer from 'nodemailer';

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  service: 'smtp',
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
});

// Templates d'emails
const emailTemplates = {
  reservationConfirmed: (clientName, serviceName, date) => ({
    subject: 'Réservation confirmée',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Réservation confirmée !</h2>
        <p>Bonjour ${clientName},</p>
        <p>Nous sommes heureux de vous informer que votre réservation pour <strong>${serviceName}</strong> a été confirmée.</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleString('fr-FR')}</p>
        <p>Merci de votre confiance et à bientôt !</p>
      </div>
    `
  }),
  
  reservationCancelled: (clientName, serviceName, date) => ({
    subject: 'Réservation refusée',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F44336;">Réservation refusée</h2>
        <p>Bonjour ${clientName},</p>
        <p>Nous sommes désolés de vous informer que votre réservation pour <strong>${serviceName}</strong> a été refusée.</p>
        <p><strong>Date demandée:</strong> ${new Date(date).toLocaleString('fr-FR')}</p>
        <p>Nous vous invitons à effectuer une nouvelle demande à une autre date ou à contacter le prestataire pour plus d'informations.</p>
      </div>
    `
  }),
  
  reservationReminder: (clientName, serviceName, date) => ({
    subject: 'Rappel de réservation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">Rappel de votre réservation</h2>
        <p>Bonjour ${clientName},</p>
        <p>Nous vous rappelons que vous avez une réservation prévue demain pour <strong>${serviceName}</strong>.</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleString('fr-FR')}</p>
        <p>À bientôt !</p>
      </div>
    `
  })
};

// Fonction pour envoyer un email
export const sendEmail = async (to, template, data) => {
  try {
    if (!emailTemplates[template]) {
      throw new Error(`Template d'email "${template}" non trouvé`);
    }
    
    const { subject, html } = emailTemplates[template](...data);
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ServiceHub" <notifications@servicehub.com>',
      to,
      subject,
      html
    });
    
    console.log(`Email envoyé: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

// Fonctions spécifiques pour les notifications de réservation
export const sendReservationConfirmation = async (client, service, date) => {
  return sendEmail(
    client.email, 
    'reservationConfirmed', 
    [client.name || client.username, service.title, date]
  );
};

export const sendReservationCancellation = async (client, service, date) => {
  return sendEmail(
    client.email, 
    'reservationCancelled', 
    [client.name || client.username, service.title, date]
  );
};

export const sendReservationReminder = async (client, service, date) => {
  return sendEmail(
    client.email, 
    'reservationReminder', 
    [client.name || client.username, service.title, date]
  );
}; 