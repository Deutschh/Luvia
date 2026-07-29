import { Router } from 'express';
import {
  createUser,
  deleteMe,
  deleteUser,
  getMe,
  getUserById,
  listUsers,
  updateMe,
  updateUser,
} from '../controllers/userController';
import { ensureAdmin, ensureAuthenticated } from '../middlewares/authMiddleware';

export const userRoutes = Router();

userRoutes.use(ensureAuthenticated);

userRoutes.get('/me', getMe);
userRoutes.patch('/me', updateMe);
userRoutes.delete('/me', deleteMe);

userRoutes.get('/', ensureAdmin, listUsers);
userRoutes.post('/', ensureAdmin, createUser);
userRoutes.get('/:id', getUserById);
userRoutes.patch('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);
