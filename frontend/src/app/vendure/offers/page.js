// pages/offers/index.js
'use client';
import { useState, useEffect } from 'react';
import "../style.css";

export default function OffersPage() {
  const emptyForm = { title: '', description: '', price: '', category: '', images: [] };
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // success or error
  const [nextId, setNextId] = useState(1);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, web, design, marketing, autre

  // Load sample data on first render
  useEffect(() => {
    // Some sample data to start with
    const sampleOffers = [
      { _id: '1', title: 'Site Web Vitrine', description: 'Création d\'un site web vitrine pour entreprise avec design moderne et responsive. Inclut jusqu\'à 5 pages et intégration des réseaux sociaux.', price: '899.99', category: 'web', images: ['image-1'] },
      { _id: '2', title: 'Logo Design', description: 'Design de logo professionnel avec 3 propositions et révisions illimitées. Format vectoriel et tous les fichiers sources inclus.', price: '199.99', category: 'design', images: ['image-2', 'image-3'] },
      { _id: '3', title: 'Campagne Marketing', description: 'Gestion complète de campagne marketing sur les réseaux sociaux pendant 1 mois. Inclut création de contenu et analyse des résultats.', price: '499.99', category: 'marketing', images: [] },
    ];
    setOffers(sampleOffers);
    setNextId(4); // Start with ID 4 for new offers
  }, []);

  // Filter offers based on search and category
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === 'all' || offer.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  // Categories with their display names
  const categories = {
    'all': 'Toutes les catégories',
    'web': 'Web & Développement',
    'design': 'Design & Graphisme',
    'marketing': 'Marketing',
    'autre': 'Autre'
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setForm(prev => ({ ...prev, images: Array.from(e.target.files) }));
  };

  // Show a message with timeout
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // Submit create or update
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Create a new offer object
      const formData = {
        ...form,
        price: form.price.toString()
      };
      
      setTimeout(() => {
        // If editing, update existing offer
        if (editingId) {
          setOffers(prev => 
            prev.map(offer => 
              offer._id === editingId 
                ? { ...formData, _id: editingId, images: [...offer.images, ...processImages(form.images)] }
                : offer
            )
          );
          showMessage('Offre mise à jour avec succès!');
        } 
        // Otherwise create new offer
        else {
          const newId = nextId.toString();
          setOffers(prev => [
            ...prev, 
            { ...formData, _id: newId, images: processImages(form.images) }
          ]);
          setNextId(nextId + 1);
          showMessage('Nouvelle offre créée avec succès!');
        }
        
        // Reset form
        setForm(emptyForm);
        setEditingId(null);
        setSubmitting(false);
      }, 500); // Simulate network delay
    } catch (err) {
      console.error('Submit error:', err);
      showMessage("Une erreur s'est produite lors de l'opération.", 'error');
      setSubmitting(false);
    }
  };

  // Helper function to process image files (for local use only)
  const processImages = (imageFiles) => {
    // In a real app, you'd process uploads. Here we just return placeholders
    return Array.from(imageFiles).map((_, index) => `image-${Date.now()}-${index}`);
  };

  // Edit an existing offer
  const handleEdit = (offer) => {
    setForm({
      title: offer.title,
      description: offer.description,
      price: offer.price,
      category: offer.category,
      images: []
    });
    setEditingId(offer._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete an offer
  const handleDelete = (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
    
    try {
      // Remove the offer with the given id
      setOffers(prev => prev.filter(offer => offer._id !== id));
      showMessage('Offre supprimée avec succès!');
    } catch (err) {
      console.error('Delete error:', err);
      showMessage('Erreur lors de la suppression', 'error');
    }
  };

  // View offer details
  const handleView = (offer) => {
    setViewingOffer(offer);
  };

  const closeView = () => {
    setViewingOffer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <header className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="text-blue-600">Gestion</span> des Offres
          </h1>
          <p className="text-gray-600 mt-1">Créez, visualisez, modifiez et supprimez vos offres de services</p>
        </header>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center justify-between`}>
            <p>{message}</p>
            <button onClick={() => setMessage('')} className="text-gray-600 hover:text-gray-800">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form for create/edit */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
                <h2 className="text-xl font-semibold text-white">
                  {editingId ? "Modifier l'offre" : 'Nouvelle Offre'}
                </h2>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                    <input
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Titre de l'offre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Description détaillée de l'offre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                    <div className="relative">
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-2 text-gray-500">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md p-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="web">Web & Développement</option>
                      <option value="design">Design & Graphisme</option>
                      <option value="marketing">Marketing</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 transition">
                      <input
                        id="file-upload"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M24 8l8 8h-6v16h-4V16h-6l8-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M4 40h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="mt-2 block text-sm font-medium text-gray-700">
                          {form.images.length ? `${form.images.length} fichier(s) sélectionné(s)` : 'Cliquez pour sélectionner des images'}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Traitement...
                        </span>
                      ) : editingId ? 'Mettre à jour' : 'Créer l\'offre'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(emptyForm);
                          setEditingId(null);
                        }}
                        className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Offers list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
                <h2 className="text-xl font-semibold text-white">
                  Liste des Offres
                </h2>
              </div>
              
              <div className="p-4 border-b">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <select
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value)}
                      className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {Object.entries(categories).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {filteredOffers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 p-4">
                    {filteredOffers.map((offer) => (
                      <div key={offer._id} className="border rounded-lg overflow-hidden hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row">
                          <div className="w-full sm:w-64 bg-gray-100 flex items-center justify-center p-4">
                            {offer.images && offer.images.length > 0 ? (
                              <div className="text-center">
                                <div className="h-32 w-32 bg-blue-100 rounded-md mx-auto flex items-center justify-center">
                                  <svg className="h-16 w-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-500 mt-1 block">{offer.images.length} image(s)</span>
                              </div>
                            ) : (
                              <div className="h-32 w-32 bg-gray-200 rounded-md flex items-center justify-center">
                                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex flex-col sm:flex-row justify-between">
                              <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
                              <div className="text-right">
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                                  {parseFloat(offer.price).toFixed(2)} €
                                </span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${
                                offer.category === 'web' ? 'bg-indigo-100 text-indigo-800' :
                                offer.category === 'design' ? 'bg-purple-100 text-purple-800' :
                                offer.category === 'marketing' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {categories[offer.category]}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{offer.description}</p>
                            <div className="mt-4 flex justify-end space-x-2">
                              <button
                                onClick={() => handleView(offer)}
                                className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition"
                              >
                                Voir
                              </button>
                              <button
                                onClick={() => handleEdit(offer)}
                                className="text-sm px-3 py-1 text-green-600 hover:bg-green-50 rounded transition"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => handleDelete(offer._id)}
                                className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune offre trouvée</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || activeTab !== 'all' ? 
                        'Essayez d\'ajuster vos critères de recherche.' : 
                        'Commencez par créer votre première offre.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Offer Modal */}
      {viewingOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-0 w-full max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{viewingOffer.title}</h3>
                <button 
                  onClick={closeView}
                  className="text-white hover:text-gray-200 transition"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-gray-800">{viewingOffer.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Prix</h4>
                      <p className="text-2xl font-bold text-blue-600">{parseFloat(viewingOffer.price).toFixed(2)} €</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Catégorie</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        viewingOffer.category === 'web' ? 'bg-indigo-100 text-indigo-800' :
                        viewingOffer.category === 'design' ? 'bg-purple-100 text-purple-800' :
                        viewingOffer.category === 'marketing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {categories[viewingOffer.category]}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Images</h4>
                  {viewingOffer.images && viewingOffer.images.length > 0 ? (
                    <div className="space-y-2">
                      {viewingOffer.images.map((img, idx) => (
                        <div key={idx} className="bg-gray-100 rounded-md p-2 flex items-center justify-center h-24">
                          <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-md p-4 text-center">
                      <p className="text-gray-500 text-sm">Aucune image disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-2">
              <button
                onClick={() => {
                  closeView();
                  handleEdit(viewingOffer);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
              >
                Modifier
              </button>
              <button
                onClick={closeView}
                className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}