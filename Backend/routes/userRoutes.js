import express from 'express';
import { register, login, getAllUsers, getUserById, getCurrentUser } from '../controllers/userController.js';
import { auth, authorize } from '../middleware/auth.js';
import { userValidationRules, validateRequest } from '../middleware/validator.js';

const router = express.Router();

// Public routes with validation
router.post('/register', userValidationRules.register, validateRequest, register);
router.post('/login', userValidationRules.login, validateRequest, login);

// Protected routes - require authentication
router.get('/me', auth, getCurrentUser);

// Admin routes - restricted to admin role
router.get('/', auth, authorize('admin'), getAllUsers);
router.get('/:id', auth, authorize('admin'), getUserById);

export default router;