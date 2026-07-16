import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rayhanluqdeanz02_db_user:5PiAajTDiE6GNXmF@cluster0.qxfdrnr.mongodb.net/?appName=Cluster0';

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/game', gameRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import http from 'http';
import { initSocket } from './socket';

const server = http.createServer(app);
const io = initSocket(server);

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
