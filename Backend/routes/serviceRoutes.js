// routes/serviceRoutes.js
import express from 'express';
import { 
  getAllServices, 
  getService, 
  createService, 
  updateService, 
  deleteService 
} from '../controllers/ServiceController.js';

const router = express.Router();

// Service routes
router.get('/', getAllServices);
router.get('/:id', getService);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
