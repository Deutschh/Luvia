import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

function generateToken(userId: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }

  return jwt.sign(
    {
      sub: userId,
    },
    secret,
    {
      expiresIn: '7d',
    }
  );
}

export async function register(request: Request, response: Response) {
  try {
    const data = registerSchema.parse(request.body);

    const userAlreadyExists = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userAlreadyExists) {
      return response.status(409).json({
        message: 'Este e-mail já está cadastrado.',
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    return response.status(201).json({
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({
        message: 'Dados inválidos.',
        errors: error.issues,
      });
    }

    console.error(error);

    return response.status(500).json({
      message: 'Erro interno ao cadastrar usuário.',
    });
  }
}

export async function login(request: Request, response: Response) {
  try {
    const data = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return response.status(401).json({
        message: 'E-mail ou senha inválidos.',
      });
    }

    const passwordMatches = await bcrypt.compare(data.password, user.password);

    if (!passwordMatches) {
      return response.status(401).json({
        message: 'E-mail ou senha inválidos.',
      });
    }

    const token = generateToken(user.id);

    return response.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({
        message: 'Dados inválidos.',
        errors: error.issues,
      });
    }

    console.error(error);

    return response.status(500).json({
      message: 'Erro interno ao fazer login.',
    });
  }
}