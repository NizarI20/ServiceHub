import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Notice the .js extension
import User from './models/User.js'; // Notice the .js extension
import Service from './models/Service.js'; // Notice the .js extension
import serviceRoutes from './routes/serviceRoutes.js'; // Notice the .js extension
import userRoutes from './routes/userRoutes.js'; // Notice the .js extension
import categoryRoutes from './routes/categoryRoutes.js'; // Notice the .js extension
import reservationRoutes from './routes/reservationRoutes.js'; // Import reservation routes
import cors from 'cors'; // <-- Import CORS
import profileRoutes from './routes/profileRoutes.js'; // Notice the .js extension
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
app.use('/api/reservations', reservationRoutes); // Add reservation routes
app.use('/api/profile', profileRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});