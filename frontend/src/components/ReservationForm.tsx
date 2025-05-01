import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { createReservation } from '../services/reservation';
import { Button } from './ui/button';

interface ReservationFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({ serviceId, serviceName, price }) => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Récupérer l'ID utilisateur du localStorage (supposant que vous stockez l'utilisateur connecté)
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user._id) {
        toast({ 
          title: "Erreur", 
          description: "Vous devez être connecté pour réserver un service", 
          variant: "destructive" 
        });
        navigate('/login');
        return;
      }

      await createReservation({
        serviceId,
        startDate,
        endDate
      });

      toast({ 
        title: "Réservation effectuée", 
        description: `Votre réservation pour ${serviceName} a été enregistrée avec succès!` 
      });
      
      // Redirection vers la page des réservations ou le tableau de bord
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast({ 
        title: "Échec de la réservation", 
        description: "Une erreur s'est produite lors de la réservation. Veuillez réessayer.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Réserver {serviceName}</h2>
      <p className="mb-4">Prix: {price} €</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de début
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de fin
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate} // Empêche de sélectionner une date antérieure à la date de début
            />
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Réservation en cours...' : 'Réserver maintenant'}
        </button>
      </form>
    </div>
  );
};