import { useEffect, useState } from 'react';
import { Calendar, Clock, AlertCircle, MoreHorizontal, HourglassIcon, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { fetchUserReservations } from '../services/reservation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Reservation {
  _id: string;
  service: {
    _id: string;
    title: string;
    prix?: number;
  };
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export default function UserReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { 
    loadReservations(); 
  }, []);

  // Effet pour recharger les réservations quand on revient sur la page
  useEffect(() => {
    // Vérifier si on vient d'une autre page (navigation)
    const handleNavigation = () => {
      loadReservations();
    };
    
    handleNavigation();
    
    // Ajouter un écouteur pour les changements de location
    window.addEventListener('focus', handleNavigation);
    
    return () => {
      window.removeEventListener('focus', handleNavigation);
    };
  }, [location]);
  
  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchUserReservations();
      console.log('Réservations chargées:', data);
      
      // Filtrer les réservations avec des services valides
      const validReservations = data.filter(reservation => {
        const isValid = reservation && reservation.service && reservation.service._id;
        if (!isValid) {
          console.warn('Réservation invalide ou sans service:', reservation);
        }
        return isValid;
      });
      
      setReservations(validReservations);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos réservations. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadReservations();
    toast({
      title: "Actualisation",
      description: "Liste des réservations actualisée.",
    });
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
        return <HourglassIcon className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Regrouper les réservations par statut
  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  const goToServiceDetails = (serviceId: string) => {
    // Simplement rediriger vers la page du service
    navigate(`/services/${serviceId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Mes réservations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="w-full h-36 animate-pulse">
              <div className="h-full bg-gray-100 rounded-md"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes réservations</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>
      
      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune réservation</h3>
          <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore effectué de réservations.</p>
          <Button 
            onClick={() => navigate('/services')}
            className="mt-4"
          >
            Explorer les services
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Explication du processus de réservation */}
          <Alert className="bg-blue-50 border-blue-100 mb-6">
            <AlertDescription className="text-blue-800">
              Lorsque vous réservez un service, votre demande est d'abord "en attente" jusqu'à ce que le vendeur la confirme ou la refuse. Vous serez notifié dès que le statut de votre réservation change.
            </AlertDescription>
          </Alert>
          
          {/* Réservations en attente */}
          {pendingReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <HourglassIcon className="h-5 w-5 text-yellow-500" />
                <span>En attente de confirmation ({pendingReservations.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingReservations.map(reservation => (
                  <Card key={reservation._id} className="overflow-hidden border-l-4 border-l-yellow-400">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{reservation.service.title}</CardTitle>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <CardDescription>
                        Réservation #{reservation._id.substring(0, 8)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-0">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Début: {new Date(reservation.startDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Fin: {new Date(reservation.endDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Demande effectuée le: {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-2 bg-yellow-50 p-2 rounded">
                          Le vendeur étudie votre demande. Vous recevrez une notification lorsqu'il aura pris sa décision.
                        </p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => goToServiceDetails(reservation.service._id)}
                      >
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Voir le service
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Réservations confirmées */}
          {confirmedReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Réservations confirmées ({confirmedReservations.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {confirmedReservations.map(reservation => (
                  <Card key={reservation._id} className="overflow-hidden border-l-4 border-l-green-400">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{reservation.service.title}</CardTitle>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <CardDescription>
                        Réservation #{reservation._id.substring(0, 8)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-0">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Début: {new Date(reservation.startDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Fin: {new Date(reservation.endDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Demande effectuée le: {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <p className="text-sm text-green-700 mt-2 bg-green-50 p-2 rounded">
                          Votre réservation a été confirmée par le vendeur. Le service est réservé aux dates indiquées.
                        </p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => goToServiceDetails(reservation.service._id)}
                      >
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Voir le service
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Réservations refusées */}
          {cancelledReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span>Réservations refusées ({cancelledReservations.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cancelledReservations.map(reservation => (
                  <Card key={reservation._id} className="overflow-hidden border-l-4 border-l-red-400">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{reservation.service.title}</CardTitle>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <CardDescription>
                        Réservation #{reservation._id.substring(0, 8)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-0">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Début: {new Date(reservation.startDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Fin: {new Date(reservation.endDate).toLocaleDateString('fr-FR', { 
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Demande effectuée le: {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <p className="text-sm text-red-700 mt-2 bg-red-50 p-2 rounded">
                          Votre demande a été refusée par le vendeur. Consultez d'autres services disponibles.
                        </p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => goToServiceDetails(reservation.service._id)}
                      >
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Voir le service
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}