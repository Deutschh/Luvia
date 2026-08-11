import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';
import { dictionaryRoutes } from './routes/dictionaryRoutes';
import { favoriteRoutes } from './routes/favoriteRoutes';
import { userRoutes } from './routes/userRoutes';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => {
  return response.json({
    message: 'API Luvia funcionando!',
  });
});

app.use('/auth', authRoutes);
app.use('/dictionary', dictionaryRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/users', userRoutes);

app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
  if (
    error &&
    typeof error === 'object' &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  ) {
    return response.status(400).json({ message: 'JSON inválido no corpo da requisição.' });
  }

  return next(error);
});
