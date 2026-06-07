import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpirationDate,
  hashRefreshToken,
} from '../utils/tokens';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(1, 'Senha obrigatória'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório'),
});

function userSelect() {
  return {
    id: true,
    name: true,
    phone: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };
}

async function createRefreshToken(userId: string) {
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      userId,
      expiresAt: getRefreshTokenExpirationDate(),
    },
  });

  return refreshToken;
}

export async function register(request: Request, response: Response) {
  try {
    const data = registerSchema.parse(request.body);

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userAlreadyExists) {
      return response.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
      },
      select: userSelect(),
    });

    const token = generateAccessToken(user.id, user.role);
    const refreshToken = await createRefreshToken(user.id);

    return response.status(201).json({ user, token, refreshToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao cadastrar usuário.' });
  }
}

export async function login(request: Request, response: Response) {
  try {
    const data = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return response.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);

    if (!passwordMatches) {
      return response.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    const token = generateAccessToken(user.id, user.role);
    const refreshToken = await createRefreshToken(user.id);

    return response.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao fazer login.' });
  }
}

export async function refresh(request: Request, response: Response) {
  try {
    const { refreshToken } = refreshSchema.parse(request.body);
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      return response.status(401).json({ message: 'Refresh token inválido ou expirado.' });
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const newRefreshToken = await createRefreshToken(storedToken.userId);
    const token = generateAccessToken(storedToken.userId, storedToken.user.role);

    return response.json({ token, refreshToken: newRefreshToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao renovar token.' });
  }
}

export async function logout(request: Request, response: Response) {
  try {
    const { refreshToken } = refreshSchema.parse(request.body);

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashRefreshToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return response.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao sair da conta.' });
  }
}
