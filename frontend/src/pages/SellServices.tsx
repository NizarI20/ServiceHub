import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
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
}

const emptyService: Service = {
  titre: '',
  description: '',
  prix: 0,
  disponibilite: true,
  condition: '',
  categorie: '',
  featuredimg: '',
};

const emptyCategory: Omit<Category, '_id'> = {
  nom: '',
  description: '',
};

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Service>(emptyService);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>(emptyCategory);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Fetch all services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Service[]>('http://localhost:3000/api/services');
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
      const res = await axios.get<Category[]>('http://localhost:3000/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      alert('Erreur lors du chargement des catégories');
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : undefined;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Create or update service
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate category
    if (!form.categorie) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Update
        const response = await axios.put(`http://localhost:3000/api/services/${editingId}`, form);
        console.log('Update response:', response.data);
        setEditingId(null);
      } else {
        // Create
        const response = await axios.post('http://localhost:3000/api/services', form);
        console.log('Create response:', response.data);
      }
      setForm(emptyService);
      await fetchServices();
    } catch (err: any) {
      console.error('Error saving service:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Erreur lors de la sauvegarde du service');
    }
    setLoading(false);
  };

  // Edit service
  const handleEdit = (service: Service) => {
    setForm(service);
    setEditingId(service._id || null);
  };

  // Delete service
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Supprimer ce service ?')) return;
    setLoading(true);
    try {
      const response = await axios.delete(`http://localhost:3000/api/services/${id}`);
      console.log('Delete response:', response.data);
      await fetchServices();
    } catch (err: any) {
      console.error('Error deleting service:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
    setLoading(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setForm(emptyService);
    setEditingId(null);
  };

  // Create new category
  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Only send nom and description to the backend
      const categoryData = {
        nom: newCategory.nom,
        description: newCategory.description
      };
      
      const response = await axios.post('http://localhost:3000/api/categories', categoryData);
      console.log('Category created:', response.data);
      setCategories(prev => [...prev, response.data]);
      setNewCategory(emptyCategory);
      setIsCategoryDialogOpen(false);
      // Update the service form to use the new category
      setForm(prev => ({
        ...prev,
        categorie: response.data._id
      }));
    } catch (err: any) {
      console.error('Error creating category:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Erreur lors de la création de la catégorie');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Services</h1>

      {/* Service Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <div className="mb-2">
          <label className="block">Titre</label>
          <input
            name="titre"
            value={form.titre}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Prix</label>
          <input
            name="prix"
            type="number"
            value={form.prix}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Disponibilité</label>
          <input
            name="disponibilite"
            type="checkbox"
            checked={form.disponibilite}
            onChange={handleChange}
            className="mr-2"
          />
          Disponible
        </div>
        <div className="mb-2">
          <label className="block">Condition</label>
          <input
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block">Catégorie <span className="text-red-500">*</span></label>
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
        </div>
        <div className="mb-2">
          <label className="block">Image (URL)</label>
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
    </div>
  );
};

export default ServicesPage;