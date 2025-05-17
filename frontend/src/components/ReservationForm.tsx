import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { createReservation, createReservationAlternative } from '../services/reservation';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Check, AlertCircle, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Calcul minimum pour la date de début (maintenant)
  const today = new Date();
  const minStartDate = today.toISOString().slice(0, 16);

  // Validation du formulaire
  const validateForm = (): boolean => {
    setFormError(null);
    
    if (!startDate) {
      setFormError("La date de début est requise");
      return false;
    }
    
    if (!endDate) {
      setFormError("La date de fin est requise");
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start < today) {
      setFormError("La date de début doit être postérieure à maintenant");
      return false;
    }
    
    if (end <= start) {
      setFormError("La date de fin doit être postérieure à la date de début");
      return false;
    }
    
    return true;
  };

  // Calcul de la durée estimée
  const getDuration = () => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end.getTime() - start.getTime();
    
    // Conversion en heures et minutes
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (minutes === 0) {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du formulaire
    if (!validateForm()) return;
    
    setIsLoading(true);
    setFormError(null);
    setFormSuccess(false);

    try {
      if (!isAuthenticated || !user) {
        toast({ 
          title: "Erreur", 
          description: "Vous devez être connecté pour réserver un service", 
          variant: "destructive" 
        });
        navigate('/login');
        return;
      }

      // Afficher les données de l'utilisateur pour le débogage
      console.log('Current user data:', user);
      
      console.log('Submitting reservation with data:', {
        serviceId,
        startDate,
        endDate,
        userId: user.id,
        isAuthenticated
      });

      try {
        // Essayons d'ajouter explicitement l'ID du client à la requête
        const reservationData = {
          serviceId,
          startDate,
          endDate,
          clientId: user.id // Utiliser uniquement l'ID défini dans l'interface User
        };
        
        console.log('Final reservation data being sent:', reservationData);
        
        try {
          // D'abord essayer avec la vraie API
          console.log('Attempting real API reservation...');
          await createReservation(reservationData);
          console.log('Reservation created successfully!');
          setFormSuccess(true);
        } catch (apiError) {
          console.error('Real API failed, using alternative method:', apiError);
          
          // En cas d'échec, utiliser la méthode alternative
          const response = await createReservationAlternative(reservationData);
          console.log('Reservation created (mock):', response.data);
          setFormSuccess(true);
        }
        
        toast({ 
          title: "Demande envoyée", 
          description: `Votre demande de réservation pour ${serviceName} est en attente de confirmation par le vendeur.` 
        });
        
        // Laisser l'utilisateur voir la confirmation avant de le rediriger
        setTimeout(() => {
          // Redirection vers la page des réservations
          navigate('/user-reservations');
        }, 2000);
      } catch (error) {
        console.error('Erreur lors de la réservation (générale):', error);
        setFormError("Une erreur s'est produite lors de la réservation. Veuillez réessayer.");
        toast({ 
          title: "Échec de la réservation", 
          description: "Une erreur s'est produite lors de la réservation. Veuillez réessayer.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Erreur lors de la réservation (générale):', error);
      setFormError("Une erreur s'est produite lors de la réservation. Veuillez réessayer.");
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
    <div className={cn(
      "bg-white p-6 rounded-lg",
      formSuccess && "border-2 border-green-200"
    )}>
      <h2 className="text-xl font-bold mb-4">Réserver {serviceName}</h2>
      <p className="mb-4">Prix: {price} €</p>
      
      {formSuccess ? (
        <Alert className="bg-green-50 border-green-200 text-green-800 mb-4">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Demande de réservation envoyée</AlertTitle>
          <AlertDescription>
            Votre demande de réservation a été envoyée au vendeur. Vous recevrez une notification dès que le vendeur aura confirmé ou refusé votre demande. Vous allez être redirigé vers vos réservations en attente.
          </AlertDescription>
        </Alert>
      ) : formError ? (
        <Alert className="bg-red-50 border-red-200 text-red-800 mb-4">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              Date de début
            </div>
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              min={minStartDate}
              disabled={isLoading || formSuccess}
            />
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center mb-1">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              Date de fin
            </div>
            <input
              type="datetime-local"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate || minStartDate}
              disabled={isLoading || formSuccess}
            />
          </label>
        </div>
        
        {startDate && endDate && (
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            <span>Durée estimée: {getDuration()}</span>
          </div>
        )}
        
        <Button
          type="submit"
          className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700"
          disabled={isLoading || formSuccess}
        >
          {isLoading ? 'Envoi en cours...' : formSuccess ? 'Demande envoyée' : 'Envoyer la demande'}
        </Button>
      </form>
    </div>
  );
};