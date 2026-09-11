import { Router } from 'express';
import {
  forgotPassword,
  googleAuth,
  login,
  logout,
  openPasswordResetLink,
  refresh,
  register,
  resetPassword,
} from '../controllers/authController';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/google', googleAuth);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.get('/reset-password-link', openPasswordResetLink);
authRoutes.post('/reset-password', resetPassword);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
