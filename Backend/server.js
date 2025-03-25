import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Notice the .js extension
import User from './models/User.js'; // Notice the .js extension

const app = express();

const PORT = 8000;

connectDB();

app.listen(
    PORT,
    () => console.log('Its live on http://localhost:${PORT}')
)