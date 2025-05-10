import express from 'express';
import { register, login, getAllUsers, getUserById, getCurrentUser } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes - require authentication
router.get('/me', authenticateUser, getCurrentUser);

// Admin routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);

export default router;