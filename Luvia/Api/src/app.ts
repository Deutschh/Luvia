import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => {
  return response.json({
    message: 'API Luvia funcionando!',
  });
});

app.use('/auth', authRoutes);