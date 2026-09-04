import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  generateAccessToken,
  generatePasswordResetToken,
  generateRefreshToken,
  getPasswordResetTokenExpirationDate,
  getRefreshTokenExpirationDate,
  hashPasswordResetToken,
  hashRefreshToken,
} from '../utils/tokens';
import { getDefaultNameFromEmail, publicUserSelect } from '../utils/publicUser';
import {
  getPasswordResetDeepLink,
  isSmtpConfigured,
  sendPasswordResetEmail,
} from '../services/mailService';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
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

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token de recuperação obrigatório'),
  newPassword: z.string().min(8, 'A nova senha precisa ter pelo menos 8 caracteres'),
});

const forgotPasswordSuccessMessage = 'Link de recuperação enviado para o e-mail cadastrado.';

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

function getPublicApiBaseUrl(request: Request) {
  const configuredBaseUrl = process.env.PUBLIC_API_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  const host = request.get('host');

  if (!host) {
    throw new Error('Não foi possível identificar a URL pública da API.');
  }

  return `${request.protocol}://${host}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };

    return entities[character];
  });
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
          avatarUrl: user.avatarUrl ?? avatarUrl,
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
            avatarUrl: userByEmail.avatarUrl ?? avatarUrl,
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

export async function forgotPassword(request: Request, response: Response) {
  try {
    const { email } = forgotPasswordSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });

    if (!user || !user.password || !isSmtpConfigured()) {
      return response.json({ message: forgotPasswordSuccessMessage });
    }

    const token = generatePasswordResetToken();
    const expiresAt = getPasswordResetTokenExpirationDate();
    const publicBaseUrl = getPublicApiBaseUrl(request);

    const passwordResetToken = await prisma.$transaction(async (transaction) => {
      await transaction.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      return transaction.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashPasswordResetToken(token),
          expiresAt,
        },
      });
    });

    try {
      await sendPasswordResetEmail(user.email, token, expiresAt, publicBaseUrl);
    } catch {
      await prisma.passwordResetToken.update({
        where: { id: passwordResetToken.id },
        data: { usedAt: new Date() },
      });
      return response.json({ message: forgotPasswordSuccessMessage });
    }

    return response.json({ message: forgotPasswordSuccessMessage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Informe um e-mail válido.', errors: error.issues });
    }

    console.error('Não foi possível processar a solicitação de redefinição de senha.');
    return response.json({ message: forgotPasswordSuccessMessage });
  }
}

export async function openPasswordResetLink(request: Request, response: Response) {
  const token = typeof request.query.token === 'string' ? request.query.token : null;

  if (!token) {
    return response.status(400).type('html').send(`
      <!doctype html>
      <html lang="pt-BR">
        <head><meta charset="utf-8"><title>Redefinir senha - Luvia</title></head>
        <body><h1>Link inválido</h1><p>Solicite um novo link de recuperação no aplicativo Luvia.</p></body>
      </html>
    `);
  }

  const deepLink = getPasswordResetDeepLink(token);
  const safeDeepLink = escapeHtml(deepLink);
  const scriptDeepLink = JSON.stringify(deepLink).replace(/</g, '\\u003c');

  return response.type('html').send(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Redefinir senha - Luvia</title>
      </head>
      <body>
        <h1>Redefinir senha - Luvia</h1>
        <p>Toque no botão abaixo para continuar no aplicativo Luvia.</p>
        <p><a href="${safeDeepLink}">Abrir no app Luvia</a></p>
        <p>Se o botão não funcionar, abra este e-mail no celular onde o app Luvia está instalado.</p>
        <script>
          window.location.href = ${scriptDeepLink};
        </script>
      </body>
    </html>
  `);
}

export async function resetPassword(request: Request, response: Response) {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(request.body);
    const tokenHash = hashPasswordResetToken(token);
    const password = await bcrypt.hash(newPassword, 10);
    const now = new Date();

    const passwordWasReset = await prisma.$transaction(async (transaction) => {
      const resetToken = await transaction.passwordResetToken.findFirst({
        where: {
          tokenHash,
          usedAt: null,
          expiresAt: { gt: now },
        },
      });

      if (!resetToken) {
        return false;
      }

      const claimedToken = await transaction.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null },
        data: { usedAt: now },
      });

      if (claimedToken.count !== 1) {
        return false;
      }

      await transaction.user.update({
        where: { id: resetToken.userId },
        data: { password },
      });

      await transaction.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, usedAt: null },
        data: { usedAt: now },
      });

      await transaction.refreshToken.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: now },
      });

      return true;
    });

    if (!passwordWasReset) {
      return response.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    return response.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Não foi possível redefinir a senha.' });
  }
}

export async function refresh(request: Request, response: Response) {
  try {
    const { refreshToken } = refreshSchema.parse(request.body);
    const tokenHash = hashRefreshToken(refreshToken);
    const now = new Date();

    const rotatedToken = await prisma.$transaction(async (transaction) => {
      const storedToken = await transaction.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= now) {
        return null;
      }

      const claimedToken = await transaction.refreshToken.updateMany({
        where: {
          id: storedToken.id,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { revokedAt: now },
      });

      if (claimedToken.count !== 1) {
        return null;
      }

      const newRefreshToken = generateRefreshToken();

      await transaction.refreshToken.create({
        data: {
          tokenHash: hashRefreshToken(newRefreshToken),
          userId: storedToken.userId,
          expiresAt: getRefreshTokenExpirationDate(),
        },
      });

      return {
        userId: storedToken.userId,
        role: storedToken.user.role,
        refreshToken: newRefreshToken,
      };
    });

    if (!rotatedToken) {
      return response.status(401).json({ message: 'Refresh token inválido ou expirado.' });
    }

    const token = generateAccessToken(rotatedToken.userId, rotatedToken.role);

    return response.json({ token, refreshToken: rotatedToken.refreshToken });
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
