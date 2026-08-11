import { Router } from 'express';
import {
  createDictionarySign,
  deleteDictionarySign,
  getDictionarySignById,
  listDictionaryCategories,
  listDictionarySigns,
  searchDictionarySigns,
  updateDictionarySign,
} from '../controllers/dictionaryController';
import { ensureAuthenticated } from '../middlewares/authMiddleware';

export const dictionaryRoutes = Router();

dictionaryRoutes.use(ensureAuthenticated);

dictionaryRoutes.get('/categories', listDictionaryCategories);
dictionaryRoutes.get('/signs/search', searchDictionarySigns);
dictionaryRoutes.get('/signs', listDictionarySigns);
dictionaryRoutes.get('/signs/:id', getDictionarySignById);
dictionaryRoutes.post('/signs', createDictionarySign);
dictionaryRoutes.patch('/signs/:id', updateDictionarySign);
dictionaryRoutes.delete('/signs/:id', deleteDictionarySign);
