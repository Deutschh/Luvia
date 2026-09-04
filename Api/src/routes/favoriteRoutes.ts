import { Router } from 'express';
import {
  addFavoriteSign,
  listFavoriteSigns,
  removeFavoriteSign,
} from '../controllers/favoriteController';
import { ensureAuthenticated } from '../middlewares/authMiddleware';

export const favoriteRoutes = Router();

favoriteRoutes.use(ensureAuthenticated);

favoriteRoutes.get('/signs', listFavoriteSigns);
favoriteRoutes.post('/signs/:signId', addFavoriteSign);
favoriteRoutes.delete('/signs/:signId', removeFavoriteSign);
