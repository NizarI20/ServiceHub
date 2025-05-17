import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Check, X, AlertCircle, Filter, MessageCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  createdAt: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // États pour la gestion des erreurs
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { 
    loadReservations(); 
  }, []);
  
  // Effet pour filtrer les réservations
  useEffect(() => {
    let result = [...reservations];
    
    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    
    // Filtre par date
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(r => {
        const startDate = new Date(r.startDate);
        startDate.setHours(0, 0, 0, 0);
        return startDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'week') {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      result = result.filter(r => new Date(r.startDate) >= weekAgo);
    }
    
    // Filtre par recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.service.title.toLowerCase().includes(query) || 
        r.client.username.toLowerCase().includes(query)
      );
    }
    
    setFilteredReservations(result);
  }, [reservations, statusFilter, dateFilter, searchQuery]);
  
  const loadReservations = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const { data } = await fetchSellerReservations();
      setReservations(data);
      setFilteredReservations(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des réservations:', error);
      
      // Message d'erreur plus clair pour l'utilisateur
      let errorMessage = "Impossible de charger les réservations. ";
      
      if (error.response) {
        // Error de réponse du serveur
        errorMessage += `Le serveur a répondu avec une erreur: ${error.response.status} ${error.response.data?.message || ''}`;
      } else if (error.request) {
        // Pas de réponse du serveur
        errorMessage += "Le serveur ne répond pas. Vérifiez votre connexion internet ou réessayez plus tard.";
      } else {
        // Erreur de configuration de la requête
        errorMessage += `Erreur: ${error.message}`;
      }
      
      setApiError(errorMessage);
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    loadReservations();
  };

  const handleConfirm = (id: string) => {
    setSelectedReservation(id);
    setCustomMessage('');
    setConfirmDialogOpen(true);
  };

  const handleCancel = (id: string) => {
    setSelectedReservation(id);
    setCustomMessage('');
    setCancelDialogOpen(true);
  };

  const processAction = async (action: 'confirm' | 'cancel') => {
    if (!selectedReservation) return;
    
    try {
      if (action === 'confirm') {
        await confirmReservation(selectedReservation, customMessage);
        toast({
          title: "Réservation acceptée",
          description: "La réservation a été acceptée avec succès.",
        });
      } else {
        await cancelReservation(selectedReservation, customMessage);
        toast({
          title: "Réservation refusée",
          description: "La réservation a été refusée avec succès.",
        });
      }
      loadReservations();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      
      // Message d'erreur approprié selon le type d'erreur
      let errorMessage = "";
      
      if (action === 'confirm') {
        errorMessage = "Impossible d'accepter la réservation. ";
      } else {
        errorMessage = "Impossible de refuser la réservation. ";
      }
      
      if (error.response) {
        errorMessage += `Erreur: ${error.response.data?.message || error.response.status}`;
      } else if (error.request) {
        errorMessage += "Le serveur ne répond pas. Vérifiez votre connexion internet.";
      } else {
        errorMessage += `Erreur: ${error.message}`;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setConfirmDialogOpen(false);
      setCancelDialogOpen(false);
      setSelectedReservation(null);
      setCustomMessage('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmée</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Terminée</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusée</Badge>;
      case 'rescheduled':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Reportée</Badge>;
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
      <h1 className="text-2xl font-bold mb-6">Gestion des réservations</h1>
      
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex-1">
            <div className="font-medium text-sm mb-2">Rechercher</div>
            <Input 
              type="text" 
              placeholder="Rechercher par service ou client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <div className="font-medium text-sm mb-2">Statut</div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="cancelled">Refusées</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="font-medium text-sm mb-2">Date</div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {apiError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry} 
            className="mt-2" 
            disabled={isRetrying}
          >
            {isRetrying ? "Réessai en cours..." : "Réessayer"}
          </Button>
        </Alert>
      )}
      
      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Filter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune réservation trouvée</h3>
          {reservations.length > 0 ? (
            <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos filtres pour voir d'autres réservations.</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore reçu de réservations pour vos services.</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Réservations en attente (triées en premier) */}
          {filteredReservations
            .filter(r => r.status === 'pending')
            .map(reservation => (
              <Card key={reservation._id} className="overflow-hidden border-l-4 border-l-yellow-400">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{reservation.service.title}</CardTitle>
                      <CardDescription>
                        Demande de {reservation.client.username || 'Client'} • Réservation #{reservation._id.substring(0, 8)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
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
                
                <CardFooter className="pt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/reservation/${reservation._id}`)}
                  >
                    Voir détails
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => handleConfirm(reservation._id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accepter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleCancel(reservation._id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                </CardFooter>
              </Card>
            ))}
          
          {/* Autres réservations */}
          {filteredReservations
            .filter(r => r.status !== 'pending')
            .map(reservation => (
              <Card 
                key={reservation._id} 
                className={`overflow-hidden border-l-4 ${
                  reservation.status === 'confirmed' ? 'border-l-green-400' : 
                  reservation.status === 'cancelled' ? 'border-l-red-400' : 
                  'border-l-gray-400'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{reservation.service.title}</CardTitle>
                      <CardDescription>
                        Demande de {reservation.client.username || 'Client'} • Réservation #{reservation._id.substring(0, 8)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
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
                      <span>Dernière mise à jour: {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/reservation/${reservation._id}`)}
                  >
                    Voir détails
                  </Button>
                </CardFooter>
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
          
          <div className="py-3">
            <label htmlFor="custom-message" className="block text-sm font-medium mb-1">
              Message personnalisé (optionnel)
            </label>
            <Textarea 
              id="custom-message"
              placeholder="Informations complémentaires pour le client..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>
          
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
          
          <div className="py-3">
            <label htmlFor="cancel-reason" className="block text-sm font-medium mb-1">
              Motif de refus (optionnel)
            </label>
            <Textarea 
              id="cancel-reason"
              placeholder="Expliquez pourquoi vous refusez cette réservation..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
            />
          </div>
          
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