import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Service from './models/Service.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});