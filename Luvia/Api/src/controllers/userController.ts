import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

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

function canManageUser(request: Request, userId: string) {
  return request.user?.role === 'ADMIN' || request.user?.id === userId;
}

export async function listUsers(request: Request, response: Response) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: userSelect(),
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
      select: userSelect(),
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
    select: userSelect(),
  });

  if (!user) {
    return response.status(404).json({ message: 'Usuário não encontrado.' });
  }

  return response.json(user);
}

export async function getUserById(request: Request, response: Response) {
  const id = String(request.params.id);

  if (!canManageUser(request, id)) {
    return response.status(403).json({ message: 'Você não pode acessar este usuário.' });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect(),
  });

  if (!user) {
    return response.status(404).json({ message: 'Usuário não encontrado.' });
  }

  return response.json(user);
}

export async function updateMe(request: Request, response: Response) {
  request.params.id = request.user!.id;
  return updateUser(request, response);
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
      select: userSelect(),
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
