import { Router } from 'express';
import { getMySettings, updateMySettings } from '../controllers/settingsController';
import { ensureAuthenticated } from '../middlewares/authMiddleware';

export const settingsRoutes = Router();

settingsRoutes.use(ensureAuthenticated);

settingsRoutes.get('/me', getMySettings);
settingsRoutes.patch('/me', updateMySettings);
