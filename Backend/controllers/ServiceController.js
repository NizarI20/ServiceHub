import Service from '../models/Service.js';

export const getAllServices = async (req, res) => {
  const services = await Service.find().populate('categorie createdBy');
  res.json(services);
};

export const getService = async (req, res) => {
  const service = await Service.findById(req.params.id);
  res.json(service);
};

export const createService = async (req, res) => {
  const newService = new Service({ ...req.body });
  await newService.save();
  res.status(201).json(newService);
};
