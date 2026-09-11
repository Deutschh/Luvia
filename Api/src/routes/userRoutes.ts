import { Router } from 'express';
import {
  createUser,
  deleteMyAvatar,
  deleteMe,
  deleteUser,
  getMe,
  getUserById,
  listUsers,
  uploadMyAvatar,
  updateMyPassword,
  updateMe,
  updateUser,
} from '../controllers/userController';
import { ensureAdmin, ensureAuthenticated } from '../middlewares/authMiddleware';
import { uploadAvatar } from '../middlewares/uploadMiddleware';

export const userRoutes = Router();

userRoutes.use(ensureAuthenticated);

userRoutes.get('/me', getMe);
userRoutes.patch('/me', updateMe);
userRoutes.patch('/me/password', updateMyPassword);
userRoutes.post('/me/avatar', uploadAvatar, uploadMyAvatar);
userRoutes.delete('/me/avatar', deleteMyAvatar);
userRoutes.delete('/me', deleteMe);

userRoutes.get('/', ensureAdmin, listUsers);
userRoutes.post('/', ensureAdmin, createUser);
userRoutes.get('/:id', getUserById);
userRoutes.patch('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);
