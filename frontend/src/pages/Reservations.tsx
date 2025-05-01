import { useEffect, useState } from 'react';
import { Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';
import {
  fetchSellerReservations,
  confirmReservation,
  cancelReservation,
} from '../services/reservation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Reservation {
  _id: string;
  service: {
    _id: string;
    title: string;
  };
  client: {
    _id: string;
    username: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { 
    loadReservations(); 
  }, []);
  
  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const { data } = await fetchSellerReservations();
      setReservations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = (id: string) => {
    setSelectedReservation(id);
    setConfirmDialogOpen(true);
  };

  const handleCancel = (id: string) => {
    setSelectedReservation(id);
    setCancelDialogOpen(true);
  };

  const processAction = async (action: 'confirm' | 'cancel') => {
    if (!selectedReservation) return;
    
    try {
      if (action === 'confirm') {
        await confirmReservation(selectedReservation);
        toast({
          title: "Réservation acceptée",
          description: "La réservation a été acceptée avec succès.",
        });
      } else {
        await cancelReservation(selectedReservation);
        toast({
          title: "Réservation refusée",
          description: "La réservation a été refusée avec succès.",
        });
      }
      loadReservations();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de la réservation.",
        variant: "destructive"
      });
    } finally {
      setConfirmDialogOpen(false);
      setCancelDialogOpen(false);
      setSelectedReservation(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmée</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      <h1 className="text-2xl font-bold mb-6">Mes réservations</h1>
      
      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune réservation</h3>
          <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore de réservations pour vos services.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map(reservation => (
            <Card key={reservation._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{reservation.service.title}</CardTitle>
                  {getStatusBadge(reservation.status)}
                </div>
                <CardDescription>
                  Réservé par {reservation.client.username}
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
                    <span>Demande reçue le: {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </CardContent>
              
              {reservation.status === 'pending' && (
                <CardFooter className="pt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                    onClick={() => handleConfirm(reservation._id)}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Accepter
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                    onClick={() => handleCancel(reservation._id)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Refuser
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              En acceptant cette réservation, vous vous engagez à fournir le service demandé aux dates indiquées.
              Le client sera notifié de votre acceptation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => processAction('confirm')} className="bg-green-600 text-white hover:bg-green-700">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser la réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le client sera notifié que vous avez refusé sa demande de réservation.
              Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => processAction('cancel')} className="bg-red-600 text-white hover:bg-red-700">
              Refuser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}