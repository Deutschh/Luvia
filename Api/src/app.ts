import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';
import { dictionaryRoutes } from './routes/dictionaryRoutes';
import { favoriteRoutes } from './routes/favoriteRoutes';
import { settingsRoutes } from './routes/settingsRoutes';
import { userRoutes } from './routes/userRoutes';

export const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (process.env.NODE_ENV !== 'production' || !origin || corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error('Origem não permitida pelo CORS.') as Error & { code?: string };
    error.code = 'CORS_ORIGIN_NOT_ALLOWED';
    return callback(error);
  },
};

app.set('trust proxy', true);
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/', (request, response) => {
  return response.json({
    message: 'API Luvia funcionando!',
  });
});

app.get('/health', (_request, response) => {
  return response.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/dictionary', dictionaryRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/settings', settingsRoutes);
app.use('/users', userRoutes);

app.use((error: unknown, _request: Request, response: Response, next: NextFunction) => {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'CORS_ORIGIN_NOT_ALLOWED'
  ) {
    return response.status(403).json({ message: 'Origem não permitida pelo CORS.' });
  }

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
