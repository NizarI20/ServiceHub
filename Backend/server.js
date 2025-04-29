import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Notice the .js extension
import User from './models/User.js'; // Notice the .js extension
import Service from './models/Service.js'; // Notice the .js extension
import serviceRoutes from './routes/serviceRoutes.js'; // Notice the .js extension
import userRoutes from './routes/userRoutes.js'; // Notice the .js extension
import categoryRoutes from './routes/categoryRoutes.js'; // Notice the .js extension
import cors from 'cors'; // <-- Import CORS
// const cors = require('cors');

const app = express();

const PORT = 3000;


connectDB();

app.use(express.json());

app.use(cors()); // <-- Enable CORS for all routes

app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);


app.listen(
    PORT,
    () => console.log('Its live on http://localhost:${PORT}')
)