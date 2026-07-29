import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/tokens';

export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return response.status(401).json({ message: 'Token não informado.' });
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ message: 'Token inválido.' });
  }

  try {
    const payload = verifyAccessToken(token);

    request.user = {
      id: payload.sub,
      role: payload.role,
    };

    return next();
  } catch {
    return response.status(401).json({ message: 'Token expirado ou inválido.' });
  }
}

export function ensureAdmin(request: Request, response: Response, next: NextFunction) {
  if (request.user?.role !== 'ADMIN') {
    return response.status(403).json({ message: 'Acesso permitido apenas para administradores.' });
  }

  return next();
}
