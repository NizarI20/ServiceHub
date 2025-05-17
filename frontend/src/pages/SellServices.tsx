import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface Category {
  _id?: string;
  nom: string;
  description: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
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
  createdBy?: string;
  provider?: string;
  title?: string;
  price?: number;
  category?: string;
}

const createEmptyService = (userId?: string): Service => ({
  titre: '',
  description: '',
  prix: 0,
  disponibilite: true,
  condition: '',
  categorie: '',
  featuredimg: '',
  createdBy: userId || ''
});

const emptyCategory: Omit<Category, '_id'> = {
  nom: '',
  description: '',
};

const ServicesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Service>(() => createEmptyService(user?.id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>(emptyCategory);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated) {
      console.log('User is not authenticated, this may cause issues with service creation');
      // Could add a redirect here if needed
    } else {
      console.log('User is authenticated:', user);
      
      // Check for token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found in localStorage! This will cause API authentication failures.');
      } else {
        console.log('Auth token found in localStorage');
      }
    }
  }, [isAuthenticated, user]);

  // Fetch all services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get<Service[]>('/services');
      setServices(res.data);
    } catch (err) {
      console.error('Error fetching services:', err);
      alert('Erreur lors du chargement des services');
    }
    setLoading(false);
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get<Category[]>('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      alert('Erreur lors du chargement des catégories');
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
    
    // Check for serviceId in URL parameters for editing
    const params = new URLSearchParams(location.search);
    const serviceId = params.get('serviceId');
    if (serviceId) {
      fetchServiceForEditing(serviceId);
    }
  }, [location.search]);

  // Fetch a single service for editing
  const fetchServiceForEditing = async (serviceId: string) => {
    setLoading(true);
    try {
      const res = await api.get<Service>(`/services/${serviceId}`);
      // Make sure disponibilite is set correctly from potential active field
      const serviceData = {
        ...res.data,
        disponibilite: res.data.disponibilite !== undefined ? res.data.disponibilite : Boolean(res.data.active)
      };
      setForm(serviceData);
      setEditingId(serviceId);
    } catch (err) {
      console.error('Error fetching service for editing:', err);
      alert('Erreur lors du chargement du service à éditer');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : undefined;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!form.titre || form.titre.trim() === '') errors.titre = 'Le titre est requis';
    if (!form.description || form.description.trim() === '') errors.description = 'La description est requise';
    if (!form.prix || isNaN(Number(form.prix)) || Number(form.prix) <= 0) errors.prix = 'Le prix doit être un nombre positif';
    if (!form.categorie) errors.categorie = 'La catégorie est requise';
    
    // Additional validations to ensure compatibility with the backend
    if (!form.condition || form.condition.trim() === '') errors.condition = 'Les conditions sont requises';
    
    // Check for provider information
    if (!user?.id) {
      console.error('No user ID found, this may cause issues when saving');
      errors.provider = 'Information du fournisseur manquante';
    }
    
    return errors;
  };

  // Create or update service
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      // If there are errors, do not submit
      return;
    }

    setLoading(true);
    try {
      // Create service data with both field naming conventions to ensure compatibility
      const serviceData = {
        ...form,
        active: form.disponibilite,
        // Map frontend field names to backend field names
        title: form.titre,
        price: form.prix,
        category: form.categorie,
        // Important: use createdBy instead of provider to match backend model
        createdBy: user?.id
      };
      
      console.log('Sending service data to API:', serviceData);
      
      if (editingId) {
        // Update
        console.log(`Updating service with ID: ${editingId}`);
        const response = await api.put(`/services/${editingId}`, serviceData);
        console.log('Update response:', response.data);
        setEditingId(null);
      } else {
        // Create
        console.log('Creating new service');
        const response = await api.post('/services', serviceData);
        console.log('Create response:', response.data);
      }
      setForm(createEmptyService(user?.id));
      await fetchServices();
    } catch (err: any) {
      console.error('Error saving service:', err);
      
      // Detailed error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
        
        // Show more specific error message
        if (err.response.data && err.response.data.error) {
          alert(`Erreur: ${err.response.data.error}`);
        } else if (err.response.status === 401) {
          alert('Erreur d\'authentification. Veuillez vous reconnecter.');
        } else if (err.response.status === 400) {
          alert('Erreur de validation des données. Vérifiez les champs du formulaire.');
        } else {
          alert(`Erreur lors de la sauvegarde du service (${err.response.status})`);
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        alert('Aucune réponse du serveur. Vérifiez votre connexion internet.');
      } else {
        // Error in setting up the request
        console.error('Error message:', err.message);
        alert('Erreur lors de la sauvegarde du service: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit service
  const handleEdit = (service: Service) => {
    setForm(service);
    setEditingId(service._id || null);
  };

  // Delete service
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    setLoading(true);
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Erreur lors de la suppression du service');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setForm(createEmptyService(user?.id));
    setEditingId(null);
  };

  // Create new category
  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategory.nom || !newCategory.description) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const res = await api.post('/categories', newCategory);
      setCategories(prev => [...prev, res.data]);
      setNewCategory(emptyCategory);
      setIsCategoryDialogOpen(false);
    } catch (err) {
      console.error('Error creating category:', err);
      alert('Erreur lors de la création de la catégorie');
    }
  };

  // Update form with user ID when user data becomes available
  useEffect(() => {
    if (user?.id && !form.createdBy) {
      setForm(prev => ({ ...prev, createdBy: user.id }));
    }
  }, [user?.id, form.createdBy]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Services</h1>

      {/* Service Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <div className="mb-2">
          <label className="block">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            name="titre"
            value={form.titre}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {formErrors?.titre && <div className="text-red-500 text-sm">{formErrors.titre}</div>}
        </div>
        <div className="mb-2">
          <label className="block">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {formErrors?.description && <div className="text-red-500 text-sm">{formErrors.description}</div>}
        </div>
        <div className="mb-2">
          <label className="block">
            Prix <span className="text-red-500">*</span>
          </label>
          <input
            name="prix"
            type="number"
            value={form.prix}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {formErrors?.prix && <div className="text-red-500 text-sm">{formErrors.prix}</div>}
        </div>
        <div className="mb-2">
          <label className="block">
            Disponibilité <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <input
              id="disponibilite"
              name="disponibilite"
              type="checkbox"
              checked={form.disponibilite}
              onChange={handleChange}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="disponibilite" className={`text-sm ${form.disponibilite ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
              {form.disponibilite ? 'Service actif et disponible' : 'Service inactif (non disponible)'}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Un service inactif ne sera pas visible pour les clients.
          </p>
        </div>
        <div className="mb-2">
          <label className="block">
            Condition <span className="text-red-500">*</span>
          </label>
          <input
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
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
                    <Label htmlFor="categoryName">Nom de la catégorie <span className="text-red-500">*</span></Label>
                    <Input
                      id="categoryName"
                      value={newCategory.nom}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, nom: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">Description <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="categoryDescription"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCategoryDialogOpen(false)}
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
            name="categorie"
            value={form.categorie}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.nom}
              </option>
            ))}
          </select>
          {formErrors?.categorie && <div className="text-red-500 text-sm">{formErrors.categorie}</div>}
        </div>
        <div className="mb-2">
          <label className="block">
            Image (URL)
          </label>
          <input
            name="featuredimg"
            value={form.featuredimg}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {editingId ? 'Mettre à jour' : 'Créer'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Services List */}
      <h2 className="text-xl font-semibold mb-2">Liste des services</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Titre</th>
              <th className="border p-2">Prix</th>
              <th className="border p-2">Disponible</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service._id}>
                <td className="border p-2">{service.titre}</td>
                <td className="border p-2">{service.prix} €</td>
                <td className="border p-2">{service.disponibilite ? 'Oui' : 'Non'}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 mr-2"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="text-red-600"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* Debug tools - only visible in development mode */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Outils de débogage</h3>
          <div className="flex gap-2">
            <button
              type="button" 
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm"
              onClick={() => {
                console.group('Service Form Debug Info');
                console.log('Current form data:', form);
                console.log('User info:', user);
                console.log('Categories:', categories);
                console.log('Editing ID:', editingId);
                console.groupEnd();
                alert('Informations de débogage enregistrées dans la console');
              }}
            >
              Afficher les données dans la console
            </button>
            <button
              type="button"
              className="bg-yellow-600 text-white px-4 py-2 rounded text-sm"
              onClick={() => {
                const testData = {
                  ...form,
                  active: form.disponibilite,
                  title: form.titre,
                  price: form.prix,
                  category: form.categorie,
                  createdBy: user?.id
                };
                console.log('Test data that would be sent:', testData);
                alert('Données de test affichées dans la console');
              }}
            >
              Tester les données à envoyer
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ces boutons n'affectent pas les données réelles et sont uniquement destinés au débogage.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;