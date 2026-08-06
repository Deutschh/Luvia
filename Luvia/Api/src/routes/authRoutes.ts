import { Router } from 'express';
import { googleAuth, login, logout, refresh, register } from '../controllers/authController';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/google', googleAuth);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
