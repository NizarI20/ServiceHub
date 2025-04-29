import express from 'express';
import {
  getCategories,
  createCategory,
  getCategoryById
} from '../controllers/CategoryController.js';

const router = express.Router();

// GET /api/categories — Get all categories
router.get('/', getCategories);

// POST /api/categories — Create a new category
router.post('/', createCategory);

// GET /api/categories/:id — Get a specific category by ID
router.get('/:id', getCategoryById);

export default router;
