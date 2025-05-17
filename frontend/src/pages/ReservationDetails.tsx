import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Check, X, ArrowLeft, 
  User, Building, HourglassIcon, CheckCircle, XCircle, Info 
} from 'lucide-react';
import { getReservationDetails } from '../services/reservation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

// Interface for the reservation details
interface ReservationDetail {
  _id: string;
  service: {
    _id: string;
    title: string;
    description?: string;
    prix?: number;
    provider?: {
      _id: string;
      name: string;
      email?: string;
    }
  };
  client: {
    _id: string;
    name: string;
    email?: string;
  };
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReservationDetailsPage() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (reservationId) {
      loadReservationDetails();
    }
  }, [reservationId]);

  const loadReservationDetails = async () => {
    if (!reservationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await getReservationDetails(reservationId);
      setReservation(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des détails de la réservation:', err);
      setError('Impossible de charger les détails de la réservation. Veuillez réessayer plus tard.');
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la réservation.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente de confirmation</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmée</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <HourglassIcon className="h-6 w-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return "Cette demande de réservation est en attente de confirmation par le prestataire.";
      case 'confirmed':
        return "Cette réservation a été confirmée par le prestataire.";
      case 'cancelled':
        return "Cette demande de réservation a été refusée par le prestataire.";
      default:
        return "";
    }
  };

  const goBack = () => {
    if (user?.role === 'client') {
      navigate('/user-reservations');
    } else if (user?.role === 'provider') {
      navigate('/reservations');
    } else {
      navigate(-1);
    }
  };

  const goToServiceDetails = () => {
    if (reservation?.service?._id) {
      navigate(`/services/${reservation.service._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Détails de la réservation</h1>
        <Card className="w-full animate-pulse">
          <div className="h-64 bg-gray-100 rounded-md"></div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Détails de la réservation</h1>
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Détails de la réservation</h1>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Réservation introuvable</AlertTitle>
          <AlertDescription>
            La réservation que vous cherchez n'existe pas ou a été supprimée.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={goBack} className="p-0 mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Détails de la réservation</h1>
      </div>

      <Card className="overflow-hidden mb-6">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-xl mb-1">{reservation.service.title}</CardTitle>
              <CardDescription>
                Réservation #{reservation._id.substring(0, 8)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(reservation.status)}
              {getStatusBadge(reservation.status)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Alert className={`mb-6 ${
            reservation.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 
            reservation.status === 'confirmed' ? 'bg-green-50 border-green-200' : 
            'bg-red-50 border-red-200'
          }`}>
            <AlertDescription className={`${
              reservation.status === 'pending' ? 'text-yellow-700' : 
              reservation.status === 'confirmed' ? 'text-green-700' : 
              'text-red-700'
            }`}>
              {getStatusMessage(reservation.status)}
              {reservation.message && (
                <div className="mt-2 p-2 bg-white bg-opacity-50 rounded-md">
                  <strong>Message:</strong> {reservation.message}
                </div>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Informations de réservation</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Date de début</div>
                    <div>{new Date(reservation.startDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Date de fin</div>
                    <div>{new Date(reservation.endDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Demande effectuée le</div>
                    <div>{new Date(reservation.createdAt).toLocaleDateString('fr-FR', { 
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}</div>
                  </div>
                </div>
                {reservation.updatedAt && reservation.updatedAt !== reservation.createdAt && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Dernière mise à jour</div>
                      <div>{new Date(reservation.updatedAt).toLocaleDateString('fr-FR', { 
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Informations de contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Client</div>
                    <div>{reservation.client.name}</div>
                    {reservation.client.email && <div className="text-sm text-gray-500">{reservation.client.email}</div>}
                  </div>
                </div>
                {reservation.service.provider && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Prestataire</div>
                      <div>{reservation.service.provider.name}</div>
                      {reservation.service.provider.email && <div className="text-sm text-gray-500">{reservation.service.provider.email}</div>}
                    </div>
                  </div>
                )}
              </div>
              
              {reservation.service.prix && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Prix du service</span>
                    <span className="text-lg font-bold">{reservation.service.prix} €</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button 
            variant="default" 
            className="w-full sm:w-auto"
            onClick={goToServiceDetails}
          >
            Voir le service
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 