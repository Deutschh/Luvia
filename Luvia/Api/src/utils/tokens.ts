import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';

type AccessTokenPayload = {
  sub: string;
  role: 'USER' | 'ADMIN';
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }

  return secret;
}

export function generateAccessToken(userId: string, role: 'USER' | 'ADMIN') {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'];

  return jwt.sign(
    {
      sub: userId,
      role,
    },
    getJwtSecret(),
    {
      expiresIn,
    }
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

export function hashRefreshToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpirationDate() {
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
