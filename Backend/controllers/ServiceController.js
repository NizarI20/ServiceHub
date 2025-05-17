import Service from '../models/Service.js';

export const getAllServices = async (req, res) => {
  try {
    // Populate both category and creator with specific fields
    const services = await Service.find()
      .populate({
        path: 'categorie',
        select: '_id nom description'
      })
      .populate({
        path: 'createdBy',
        select: '_id name email role'
      });
    
    console.log('Services fetched successfully:', services.length);
    res.json(services);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ message: 'Failed to fetch services', error: err.message });
  }
};

export const getService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    
    // Vérifier si c'est un ID de test (commençant par "mock-")
    const isMockId = serviceId.startsWith('mock-');
    
    // Validate ID format only for real MongoDB IDs (not mock IDs)
    if (!isMockId && !serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid service ID format' });
    }
    
    // Si c'est un ID de test, renvoyer un service de test
    if (isMockId) {
      // Générer un service de test à renvoyer
      const mockService = {
        _id: serviceId,
        titre: 'Service de test',
        description: 'Description du service de test',
        prix: 99.99,
        disponibilite: true,
        condition: 'Conditions du service de test',
        categorie: {
          _id: 'mock-category',
          nom: 'Catégorie de test',
          description: 'Description de la catégorie'
        },
        createdBy: {
          _id: 'mock-user',
          name: 'Utilisateur de test',
          email: 'test@example.com',
          role: 'vendor'
        },
        featuredimg: 'https://via.placeholder.com/300x200'
      };
      
      console.log('Mock service generated:', mockService._id);
      return res.json(mockService);
    }
    
    // Pour les ID réels, chercher dans la base de données
    // Populate both category and creator with specific fields
    const service = await Service.findById(serviceId)
      .populate({
        path: 'categorie',
        select: '_id nom description'
      })
      .populate({
        path: 'createdBy',
        select: '_id name email role'
      });
      
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    console.log('Service fetched successfully:', service._id);
    res.json(service);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ message: 'Failed to fetch service', error: err.message });
  }
};

export const createService = async (req, res) => {
  try {
    // Associate the service with the current user
    const newService = new Service({
      ...req.body,
      createdBy: req.user._id // This comes from the auth middleware
    });
    
    await newService.save();
    
    // Populate the createdBy field for the response
    const populatedService = await Service.findById(newService._id).populate('createdBy');
    
    res.status(201).json(populatedService);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateService = async (req, res) => {
  try {
    // First find the service to check ownership
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if the current user is the owner of the service
    if (service.createdBy && service.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this service' });
    }
    
    // Update the service
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy');
    
    res.json(updatedService);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    // First find the service to check ownership
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if the current user is the owner of the service
    if (service.createdBy && service.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this service' });
    }
    
    // Delete the service
    await Service.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: err.message });
  }
};