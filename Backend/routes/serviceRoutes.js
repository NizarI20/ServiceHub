// routes/serviceRoutes.js
import express from 'express';
import { getAllServices, getService, createService } from '../controllers/ServiceController.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getService);
router.post('/', createService);

export default router;
