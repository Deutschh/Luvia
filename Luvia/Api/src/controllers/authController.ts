import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpirationDate,
  hashRefreshToken,
} from '../utils/tokens';
import { getDefaultNameFromEmail, publicUserSelect } from '../utils/publicUser';

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

const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'idToken do Google obrigatório'),
});

const googleClient = new OAuth2Client();

function getGoogleClientId() {
  const clientId = process.env.GOOGLE_WEB_CLIENT_ID;

  if (!clientId) {
    throw new Error('GOOGLE_WEB_CLIENT_ID não configurado');
  }

  return clientId;
}

async function verifyGoogleIdToken(idToken: string) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: getGoogleClientId(),
    });

    return ticket.getPayload() ?? null;
  } catch {
    return null;
  }
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
      select: publicUserSelect,
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
      select: {
        ...publicUserSelect,
        password: true,
      },
    });

    if (!user) {
      return response.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    if (!user.password) {
      return response.status(401).json({ message: 'Use o login com Google para acessar esta conta.' });
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);

    if (!passwordMatches) {
      return response.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    const { password, ...publicUser } = user;
    const token = generateAccessToken(user.id, user.role);
    const refreshToken = await createRefreshToken(user.id);

    return response.json({
      user: publicUser,
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

export async function googleAuth(request: Request, response: Response) {
  try {
    const { idToken } = googleAuthSchema.parse(request.body);
    const payload = await verifyGoogleIdToken(idToken);

    if (!payload?.sub) {
      return response.status(401).json({ message: 'idToken do Google inválido.' });
    }

    const googleId = payload.sub;
    const email = payload.email?.toLowerCase();
    const avatarUrl = payload.picture;

    if (!email) {
      return response.status(400).json({ message: 'A conta Google informada não possui e-mail.' });
    }

    if (payload.email_verified !== true) {
      return response.status(403).json({ message: 'O e-mail da conta Google não está verificado.' });
    }

    let user = await prisma.user.findUnique({
      where: { googleId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: avatarUrl ?? user.avatarUrl,
          authProvider: 'GOOGLE',
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      });
    } else {
      const userByEmail = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          googleId: true,
          avatarUrl: true,
        },
      });

      if (userByEmail) {
        if (userByEmail.googleId && userByEmail.googleId !== googleId) {
          return response.status(409).json({ message: 'Este e-mail já está vinculado a outra conta Google.' });
        }

        user = await prisma.user.update({
          where: { id: userByEmail.id },
          data: {
            googleId,
            avatarUrl: avatarUrl ?? userByEmail.avatarUrl,
            authProvider: 'GOOGLE',
          },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            name: payload.name?.trim() || getDefaultNameFromEmail(email),
            email,
            googleId,
            avatarUrl,
            authProvider: 'GOOGLE',
            password: null,
            role: 'USER',
          },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        });
      }
    }

    const publicUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: publicUserSelect,
    });

    if (!publicUser) {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const token = generateAccessToken(publicUser.id, publicUser.role);
    const refreshToken = await createRefreshToken(publicUser.id);

    return response.json({
      user: publicUser,
      token,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao autenticar com Google.' });
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
