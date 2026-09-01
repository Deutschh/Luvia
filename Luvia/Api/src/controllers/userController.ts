import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AVATARS_DIRECTORY } from '../middlewares/uploadMiddleware';
import { publicUserSelect } from '../utils/publicUser';

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').toLowerCase(),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').toLowerCase().optional(),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres').optional(),
});

const updateMyProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Nome obrigatório').max(80, 'Nome deve ter no máximo 80 caracteres.').optional(),
    phone: z
      .union([z.string().trim().max(30, 'Telefone deve ter no máximo 30 caracteres.'), z.null()])
      .transform((value) => (value === '' ? null : value))
      .refine(
        (value) => {
          if (value === null) {
            return true;
          }

          const digits = value.replace(/\D/g, '');
          return /^[0-9()\s-]+$/.test(value) && (digits.length === 10 || digits.length === 11);
        },
        { message: 'Telefone inválido.' }
      )
      .optional(),
    avatarUrl: z
      .union([z.string().trim().max(2048, 'avatarUrl deve ter no máximo 2048 caracteres.'), z.null()])
      .transform((value) => (value === '' ? null : value))
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um dado do perfil para atualizar.',
  });

const updateMyPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória.').optional(),
    newPassword: z.string().min(8, 'A nova senha precisa ter pelo menos 8 caracteres.'),
  })
  .strict();

function canManageUser(request: Request, userId: string) {
  return request.user?.role === 'ADMIN' || request.user?.id === userId;
}

function getLocalAvatarPath(avatarUrl: string | null) {
  if (!avatarUrl) {
    return null;
  }

  let pathname = avatarUrl;

  try {
    pathname = new URL(avatarUrl).pathname;
  } catch {
    // Local avatar URLs are normally absolute, but this also supports old relative paths.
  }

  const publicPrefix = '/uploads/avatars/';

  if (!pathname.startsWith(publicPrefix)) {
    return null;
  }

  const fileName = decodeURIComponent(pathname.slice(publicPrefix.length));

  if (!fileName || fileName !== path.basename(fileName)) {
    return null;
  }

  return path.join(AVATARS_DIRECTORY, fileName);
}

async function removeLocalAvatar(avatarUrl: string | null) {
  const avatarPath = getLocalAvatarPath(avatarUrl);

  if (!avatarPath) {
    return;
  }

  try {
    await unlink(avatarPath);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      return;
    }

    console.error('Erro ao remover avatar local antigo.', error);
  }
}

export async function listUsers(request: Request, response: Response) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: publicUserSelect,
  });

  return response.json(users);
}

export async function createUser(request: Request, response: Response) {
  try {
    const data = createUserSchema.parse(request.body);

    const userAlreadyExists = await prisma.user.findUnique({ where: { email: data.email } });

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
        role: data.role || 'USER',
      },
      select: publicUserSelect,
    });

    return response.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
}

export async function getMe(request: Request, response: Response) {
  const user = await prisma.user.findUnique({
    where: { id: request.user!.id },
    select: {
      ...publicUserSelect,
      password: true,
    },
  });

  if (!user) {
    return response.status(404).json({ message: 'Usuário não encontrado.' });
  }

  const { password, ...publicUser } = user;

  return response.json({
    ...publicUser,
    hasPassword: Boolean(password),
  });
}

export async function getUserById(request: Request, response: Response) {
  const id = String(request.params.id);

  if (!canManageUser(request, id)) {
    return response.status(403).json({ message: 'Você não pode acessar este usuário.' });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!user) {
    return response.status(404).json({ message: 'Usuário não encontrado.' });
  }

  return response.json(user);
}

export async function updateMe(request: Request, response: Response) {
  try {
    const data = updateMyProfileSchema.parse(request.body);

    const user = await prisma.user.update({
      where: { id: request.user!.id },
      data,
      select: publicUserSelect,
    });

    return response.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao atualizar perfil.' });
  }
}

export async function updateMyPassword(request: Request, response: Response) {
  try {
    const data = updateMyPasswordSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      select: { password: true },
    });

    if (!user) {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (user.password) {
      if (!data.currentPassword) {
        return response.status(400).json({ message: 'Informe sua senha atual.' });
      }

      const currentPasswordMatches = await bcrypt.compare(data.currentPassword, user.password);

      if (!currentPasswordMatches) {
        return response.status(401).json({ message: 'Senha atual incorreta.' });
      }

      const newPasswordMatchesCurrent = await bcrypt.compare(data.newPassword, user.password);

      if (newPasswordMatchesCurrent) {
        return response.status(400).json({ message: 'A nova senha deve ser diferente da senha atual.' });
      }
    }

    await prisma.user.update({
      where: { id: request.user!.id },
      data: { password: await bcrypt.hash(data.newPassword, 10) },
    });

    return response.json({ message: 'Senha atualizada com sucesso.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao atualizar senha.' });
  }
}

export async function uploadMyAvatar(request: Request, response: Response) {
  if (!request.file) {
    return response.status(400).json({ message: 'Envie uma imagem no campo avatar.' });
  }

  const uploadedAvatarUrl = `/uploads/avatars/${encodeURIComponent(request.file.filename)}`;

  try {
    const host = request.get('host');

    if (!host) {
      await removeLocalAvatar(uploadedAvatarUrl);
      return response.status(500).json({ message: 'Não foi possível gerar a URL do avatar.' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: request.user!.id },
      select: { avatarUrl: true },
    });

    if (!currentUser) {
      await removeLocalAvatar(uploadedAvatarUrl);
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const avatarUrl = `${request.protocol}://${host}${uploadedAvatarUrl}`;
    const user = await prisma.user.update({
      where: { id: request.user!.id },
      data: { avatarUrl },
      select: publicUserSelect,
    });

    await removeLocalAvatar(currentUser.avatarUrl);

    return response.json(user);
  } catch (error) {
    await removeLocalAvatar(uploadedAvatarUrl);
    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao enviar avatar.' });
  }
}

export async function deleteMyAvatar(request: Request, response: Response) {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: request.user!.id },
      select: { avatarUrl: true },
    });

    if (!currentUser) {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = await prisma.user.update({
      where: { id: request.user!.id },
      data: { avatarUrl: null },
      select: publicUserSelect,
    });

    await removeLocalAvatar(currentUser.avatarUrl);

    return response.json(user);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao remover avatar.' });
  }
}

export async function updateUser(request: Request, response: Response) {
  try {
    const id = String(request.params.id);

    if (!canManageUser(request, id)) {
      return response.status(403).json({ message: 'Você não pode alterar este usuário.' });
    }

    const data = updateUserSchema.parse(request.body);

    if (data.email) {
      const emailAlreadyInUse = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (emailAlreadyInUse) {
        return response.status(409).json({ message: 'Este e-mail já está em uso.' });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password ? await bcrypt.hash(data.password, 10) : undefined,
      },
      select: publicUserSelect,
    });

    return response.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao atualizar usuário.' });
  }
}

export async function deleteMe(request: Request, response: Response) {
  request.params.id = request.user!.id;
  return deleteUser(request, response);
}

export async function deleteUser(request: Request, response: Response) {
  try {
    const id = String(request.params.id);

    if (!canManageUser(request, id)) {
      return response.status(403).json({ message: 'Você não pode remover este usuário.' });
    }

    await prisma.user.delete({ where: { id } });

    return response.status(204).send();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao remover usuário.' });
  }
}
