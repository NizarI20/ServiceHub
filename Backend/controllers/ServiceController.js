import Service from '../models/Service.js';

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('categorie createdBy');
    res.json(services);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createService = async (req, res) => {
  try {
    const newService = new Service({ ...req.body });
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(updatedService);
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: err.message });
  }
};