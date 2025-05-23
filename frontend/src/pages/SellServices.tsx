import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit2, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Enhanced interfaces with better typing
interface Category {
  _id: string;
  nom: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'provider' | 'client' | 'admin';
}

interface Service {
  _id?: string;
  titre: string;
  description: string;
  prix: number;
  disponibilite: boolean;
  condition: string;
  categorie: string;
  featuredimg?: string;
  active?: boolean;
  createdBy?: string | {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  provider?: string;
  title?: string;
  price?: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  request?: any;
  message?: string;
}

// Utility functions
const createEmptyService = (userId?: string): Service => ({
  titre: '',
  description: '',
  prix: 0,
  disponibilite: true,
  condition: '',
  categorie: '',
  featuredimg: '',
  createdBy: userId || '',
  provider: userId || ''
});

const emptyCategory: Omit<Category, '_id'> = {
  nom: '',
  description: '',
};

// Custom hooks for better state management
const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (userId?: string) => {
    if (!userId) {
      console.log('No userId provided, skipping fetch');
      setServices([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('Starting fetchServices with userId:', userId);
      const response = await api.get<Service[]>('/services');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Aucune donnée reçue du serveur ou format invalide');
      }
      console.log('Raw API response:', response.data);
      const userServices = response.data.filter(service => {
        if (!service) return false;
        if (!service.createdBy) return false;
        let createdById: string;
        if (typeof service.createdBy === 'string') {
          createdById = service.createdBy;
        } else if (service.createdBy && typeof service.createdBy === 'object') {
          createdById = service.createdBy._id;
        } else {
          return false;
        }
        return String(createdById).trim() === String(userId).trim();
      });
      setServices(userServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des services';
      setError(errorMessage);
      setServices([]); // Clear services on error
    } finally {
      setLoading(false);
    }
  }, []);

  return { services, setServices, loading, error, fetchServices };
};

const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (err) {
      const errorMessage = 'Erreur lors du chargement des catégories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData: Omit<Category, '_id'>) => {
    try {
      const response = await api.post<Category>('/categories', categoryData);
      setCategories(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error creating category:', err);
      return { success: false, error: 'Erreur lors de la création de la catégorie' };
    }
  }, []);

  return { categories, setCategories, loading, error, fetchCategories, createCategory };
};

const ServicesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Debug log to see user object structure
  useEffect(() => {
    if (user) {
      console.log('User object structure:', {
        user,
        keys: Object.keys(user),
        id: user.id
      });
    }
  }, [user]);

  // Custom hooks
  const { services, setServices, loading: servicesLoading, error: servicesError, fetchServices } = useServices();
  const { categories, loading: categoriesLoading, error: categoriesError, fetchCategories, createCategory } = useCategories();
  
  // Form state
  const [form, setForm] = useState<Service>(() => createEmptyService(user?.id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Category dialog state
  const [newCategory, setNewCategory] = useState<Omit<Category, '_id'>>(emptyCategory);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // General UI state
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Enhanced authentication and user ID handling
  useEffect(() => {
    if (!isAuthenticated) {
      setGlobalError('Vous devez être connecté pour gérer les services');
      setServices([]);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setGlobalError('Token d\'authentification manquant. Veuillez vous reconnecter.');
      setServices([]);
      return;
    }
    if (!user) {
      setGlobalError('Informations utilisateur manquantes');
      setServices([]);
      return;
    }
    const userId = user.id;
    if (!userId) {
      setGlobalError('ID utilisateur manquant');
      setServices([]);
      return;
    }
    setGlobalError(null);
  }, [isAuthenticated, user, setServices]);

  // Enhanced data fetching with better user validation
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Fetching services for user:', {
        user,
        userKeys: Object.keys(user),
        userValues: Object.values(user),
        userStringified: JSON.stringify(user, null, 2)
      });
      
      // Get user ID with fallback
      const userId = user.id;
      
      if (userId) {
        console.log('Using userId for fetch:', userId);
        fetchServices(userId);
        fetchCategories();
      } else {
        console.error('No valid user ID found');
        setGlobalError('ID utilisateur invalide');
        setServices([]);
      }
    } else {
      console.log('Not authenticated or user missing:', { isAuthenticated, user });
      setServices([]);
    }
  }, [isAuthenticated, user, fetchServices, fetchCategories, setServices]);

  // Enhanced form initialization with better user ID handling
  useEffect(() => {
    if (user) {
      const userId = user.id;
      if (userId && !form.createdBy) {
        setForm(prev => ({ ...prev, createdBy: userId }));
      }
    }
  }, [user, form.createdBy]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle URL parameters for editing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceId = params.get('serviceId');
    if (serviceId && isAuthenticated) {
      fetchServiceForEditing(serviceId);
    }
  }, [location.search, isAuthenticated]);

  // Fetch a single service for editing
  const fetchServiceForEditing = async (serviceId: string) => {
    setSubmitLoading(true);
    try {
      const response = await api.get<Service>(`/services/${serviceId}`);
      const serviceData = {
        ...response.data,
        disponibilite: response.data.disponibilite !== undefined 
          ? response.data.disponibilite 
          : Boolean(response.data.active)
      };
      setForm(serviceData);
      setEditingId(serviceId);
    } catch (err) {
      setGlobalError('Erreur lors du chargement du service à éditer');
      console.error('Error fetching service for editing:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Enhanced form validation
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    
    if (!form.titre?.trim()) {
      errors.titre = 'Le titre est requis';
    } else if (form.titre.trim().length < 3) {
      errors.titre = 'Le titre doit contenir au moins 3 caractères';
    }
    
    if (!form.description?.trim()) {
      errors.description = 'La description est requise';
    } else if (form.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères';
    }
    
    if (!form.prix || isNaN(Number(form.prix)) || Number(form.prix) <= 0) {
      errors.prix = 'Le prix doit être un nombre positif';
    }
    
    if (!form.categorie) {
      errors.categorie = 'La catégorie est requise';
    }
    
    if (!form.condition?.trim()) {
      errors.condition = 'Les conditions sont requises';
    }
    
    if (form.featuredimg && form.featuredimg.trim()) {
      try {
        new URL(form.featuredimg);
      } catch {
        errors.featuredimg = 'L\'URL de l\'image n\'est pas valide';
      }
    }
    
    if (!user?.id) {
      errors.provider = 'Information du fournisseur manquante';
    }
    
    return errors;
  };

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : undefined;
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Enhanced form submission with better user validation
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMessage(null);
    if (!user) {
      setGlobalError('Utilisateur non connecté');
      return;
    }
    const userId = user.id;
    if (!userId) {
      setGlobalError('ID utilisateur manquant');
      return;
    }
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setGlobalError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setSubmitLoading(true);
    
    try {
      const serviceData = {
        ...form,
        active: form.disponibilite,
        title: form.titre,
        price: form.prix,
        category: form.categorie,
        createdBy: userId,
        provider: userId
      };
      
      if (editingId) {
        await api.put(`/services/${editingId}`, serviceData);
        setSuccessMessage('Service mis à jour avec succès');
        setEditingId(null);
      } else {
        await api.post('/services', serviceData);
        setSuccessMessage('Service créé avec succès');
      }
      
      setForm(createEmptyService(userId));
      setFormErrors({});
      await fetchServices(userId);
      
    } catch (err) {
      handleApiError(err as ApiError);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Enhanced error handling
  const handleApiError = (err: ApiError) => {
    console.error('API Error:', err);
    
    if (err.response?.data?.error) {
      setGlobalError(err.response.data.error);
    } else if (err.response?.data?.message) {
      setGlobalError(err.response.data.message);
    } else if (err.response?.status === 401) {
      setGlobalError('Erreur d\'authentification. Veuillez vous reconnecter.');
    } else if (err.response?.status === 400) {
      setGlobalError('Données invalides. Vérifiez les champs du formulaire.');
    } else if (err.response?.status === 403) {
      setGlobalError('Vous n\'avez pas les permissions nécessaires.');
    } else if (err.request) {
      setGlobalError('Aucune réponse du serveur. Vérifiez votre connexion internet.');
    } else {
      setGlobalError('Une erreur inattendue s\'est produite.');
    }
  };

  // Handle service editing
  const handleEdit = (service: Service) => {
    setForm(service);
    setEditingId(service._id || null);
    setFormErrors({});
    setGlobalError(null);
    setSuccessMessage(null);
  };

  // Enhanced service deletion with better ownership validation
  const handleDelete = async (id?: string) => {
    if (!id) {
      setGlobalError('ID du service manquant');
      return;
    }
    if (!isAuthenticated || !user) {
      setGlobalError('Vous devez être connecté pour supprimer un service');
      return;
    }
    const userId = user.id;
    if (!userId) {
      setGlobalError('ID utilisateur manquant');
      return;
    }
    const serviceToDelete = services.find(s => s._id === id);
    if (!serviceToDelete) {
      setGlobalError('Service non trouvé');
      return;
    }
    let createdById: string;
    if (typeof serviceToDelete.createdBy === 'string') {
      createdById = serviceToDelete.createdBy;
    } else if (serviceToDelete.createdBy && typeof serviceToDelete.createdBy === 'object') {
      createdById = serviceToDelete.createdBy._id;
    } else {
      setGlobalError('Informations du propriétaire du service invalides');
      return;
    }
    if (String(createdById).trim() !== String(userId).trim()) {
      setGlobalError('Vous n\'êtes pas autorisé à supprimer ce service');
      return;
    }
    setSubmitLoading(true);
    try {
      await api.delete(`/services/${id}`);
      setSuccessMessage('Service supprimé avec succès');
      await fetchServices(userId);
    } catch (err) {
      handleApiError(err as ApiError);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setForm(createEmptyService(user?.id));
    setEditingId(null);
    setFormErrors({});
    setGlobalError(null);
    setSuccessMessage(null);
  };

  // Handle category creation
  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.nom?.trim() || !newCategory.description?.trim()) {
      setGlobalError('Veuillez remplir tous les champs de la catégorie');
      return;
    }

    const result = await createCategory(newCategory);
    
    if (result.success) {
      setNewCategory(emptyCategory);
      setIsCategoryDialogOpen(false);
      setSuccessMessage('Catégorie créée avec succès');
    } else {
      setGlobalError(result.error || 'Erreur lors de la création de la catégorie');
    }
  };

  // Show loading state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Services</h1>
        {user && (
          <div className="text-sm text-gray-600">
            Connecté en tant que: <span className="font-medium">{user.name}</span>
            <div className="text-xs text-gray-500 mt-1">
              Services créés: {services.length}
            </div>
          </div>
        )}
      </div>

      {/* Global Messages */}
      {globalError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {servicesError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{servicesError}</AlertDescription>
        </Alert>
      )}

      {categoriesError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{categoriesError}</AlertDescription>
        </Alert>
      )}

      {/* Service Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          {editingId ? 'Modifier le service' : 'Créer un nouveau service'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="titre" className="text-sm font-medium text-gray-700">
            Titre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titre"
            name="titre"
            value={form.titre}
            onChange={handleChange}
                className={`mt-1 ${formErrors.titre ? 'border-red-500' : ''}`}
                placeholder="Entrez le titre du service"
                disabled={submitLoading}
          />
              {formErrors.titre && (
                <p className="mt-1 text-sm text-red-600">{formErrors.titre}</p>
              )}
        </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
                className={`mt-1 ${formErrors.description ? 'border-red-500' : ''}`}
                placeholder="Décrivez votre service en détail"
                rows={4}
                disabled={submitLoading}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
        </div>

            {/* Price */}
            <div>
              <Label htmlFor="prix" className="text-sm font-medium text-gray-700">
                Prix (€) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prix"
            name="prix"
            type="number"
                min="0"
                step="0.01"
            value={form.prix}
            onChange={handleChange}
                className={`mt-1 ${formErrors.prix ? 'border-red-500' : ''}`}
                placeholder="0.00"
                disabled={submitLoading}
          />
              {formErrors.prix && (
                <p className="mt-1 text-sm text-red-600">{formErrors.prix}</p>
              )}
        </div>

            {/* Availability */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
            Disponibilité <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-center space-x-2">
            <input
              id="disponibilite"
              name="disponibilite"
              type="checkbox"
              checked={form.disponibilite}
              onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={submitLoading}
                />
                <Label htmlFor="disponibilite" className={`text-sm ${form.disponibilite ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                  {form.disponibilite ? 'Service actif et disponible' : 'Service inactif'}
                </Label>
          </div>
              <p className="mt-1 text-xs text-gray-500">
            Un service inactif ne sera pas visible pour les clients.
          </p>
        </div>

            {/* Condition */}
            <div className="md:col-span-2">
              <Label htmlFor="condition" className="text-sm font-medium text-gray-700">
                Conditions <span className="text-red-500">*</span>
              </Label>
              <Input
                id="condition"
            name="condition"
            value={form.condition}
            onChange={handleChange}
                className={`mt-1 ${formErrors.condition ? 'border-red-500' : ''}`}
                placeholder="Conditions d'utilisation du service"
                disabled={submitLoading}
          />
              {formErrors.condition && (
                <p className="mt-1 text-sm text-red-600">{formErrors.condition}</p>
              )}
        </div>

            {/* Category */}
            <div>
          <div className="flex justify-between items-center mb-1">
                <Label htmlFor="categorie" className="text-sm font-medium text-gray-700">
              Catégorie <span className="text-red-500">*</span>
                </Label>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      disabled={categoriesLoading || submitLoading}
                    >
                  <Plus size={16} />
                  Nouvelle catégorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                        <Label htmlFor="categoryName">
                          Nom de la catégorie <span className="text-red-500">*</span>
                        </Label>
                    <Input
                      id="categoryName"
                      value={newCategory.nom}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, nom: e.target.value }))}
                          placeholder="Nom de la catégorie"
                      required
                    />
                  </div>
                  <div>
                        <Label htmlFor="categoryDescription">
                          Description <span className="text-red-500">*</span>
                        </Label>
                    <Textarea
                      id="categoryDescription"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description de la catégorie"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                          onClick={() => {
                            setIsCategoryDialogOpen(false);
                            setNewCategory(emptyCategory);
                          }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      Créer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
              
          <select
                id="categorie"
            name="categorie"
            value={form.categorie}
            onChange={handleChange}
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.categorie ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={categoriesLoading || submitLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Chargement...' : 'Sélectionner une catégorie'}
                </option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.nom}
              </option>
            ))}
          </select>
              {formErrors.categorie && (
                <p className="mt-1 text-sm text-red-600">{formErrors.categorie}</p>
              )}
        </div>

            {/* Featured Image */}
            <div>
              <Label htmlFor="featuredimg" className="text-sm font-medium text-gray-700">
            Image (URL)
              </Label>
              <Input
                id="featuredimg"
            name="featuredimg"
                type="url"
            value={form.featuredimg}
            onChange={handleChange}
                className={`mt-1 ${formErrors.featuredimg ? 'border-red-500' : ''}`}
                placeholder="https://exemple.com/image.jpg"
                disabled={submitLoading}
          />
              {formErrors.featuredimg && (
                <p className="mt-1 text-sm text-red-600">{formErrors.featuredimg}</p>
              )}
            </div>
        </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
            type="submit"
              disabled={submitLoading || categoriesLoading}
              className="flex items-center gap-2"
            >
              {submitLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? 'Mettre à jour' : 'Créer le service'}
            </Button>
            
          {editingId && (
              <Button
              type="button"
                variant="outline"
              onClick={handleCancel}
                disabled={submitLoading}
            >
              Annuler
              </Button>
          )}
        </div>
      </form>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Mes Services</h2>
          <p className="text-sm text-gray-600 mt-1">
            {services.length} service{services.length !== 1 ? 's' : ''} enregistré{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          {servicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Chargement des services...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Vous n'avez pas encore créé de service.</p>
              <p className="text-sm">Créez votre premier service ci-dessus.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
            </tr>
          </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map(service => {
                  let categoryName = 'Non catégorisé';
                  const categorie = service.categorie as string | { nom: string } | null;
                  if (categorie && typeof categorie === 'object' && 'nom' in categorie) {
                    categoryName = categorie.nom;
                  } else if (categorie && typeof categorie === 'string') {
                    const category = categories.find(cat => cat._id === categorie);
                    if (category) categoryName = category.nom;
                  }
                  return (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {service.titre}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {service.prix.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          service.disponibilite 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.disponibilite ? 'Disponible' : 'Indisponible'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {categoryName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                    onClick={() => handleEdit(service)}
                            disabled={submitLoading}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={submitLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce service ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le service sera définitivement supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                      onClick={() => handleDelete(service._id)}
                                className="bg-red-600 hover:bg-red-700"
                      >
                                Supprimer
                              </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;