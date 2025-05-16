// routes/serviceRoutes.js
import express from 'express';
import { 
  getAllServices, 
  getService, 
  createService, 
  updateService, 
  deleteService 
} from '../controllers/ServiceController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getService);

// Protected routes - require authentication and provider role
router.post('/', auth, authorize('provider'), createService);
router.put('/:id', auth, updateService);
router.delete('/:id', auth, deleteService);

export default router;
