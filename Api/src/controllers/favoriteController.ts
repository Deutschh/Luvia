import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { dictionarySignSelect, getVisibleSignsWhere } from '../utils/dictionary';

const signIdParamSchema = z.object({
  signId: z.string().uuid('Id do sinal inválido.'),
});

export async function listFavoriteSigns(request: Request, response: Response) {
  try {
    const favorites = await prisma.favoriteSign.findMany({
      where: { userId: request.user!.id },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        sign: {
          select: dictionarySignSelect,
        },
      },
    });

    return response.json(
      favorites.map((favorite) => ({
        ...favorite.sign,
        favoritedAt: favorite.createdAt,
      }))
    );
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao listar favoritos.' });
  }
}

export async function addFavoriteSign(request: Request, response: Response) {
  try {
    const { signId } = signIdParamSchema.parse(request.params);

    const sign = await prisma.dictionarySign.findFirst({
      where: {
        id: signId,
        ...getVisibleSignsWhere(request.user!.id),
      },
      select: dictionarySignSelect,
    });

    if (!sign) {
      return response.status(404).json({ message: 'Sinal não encontrado.' });
    }

    const favorite = await prisma.favoriteSign.create({
      data: {
        userId: request.user!.id,
        signId,
      },
      select: {
        createdAt: true,
      },
    });

    return response.status(201).json({
      ...sign,
      favoritedAt: favorite.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return response.status(409).json({ message: 'Este sinal já está nos favoritos.' });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao favoritar sinal.' });
  }
}

export async function removeFavoriteSign(request: Request, response: Response) {
  try {
    const { signId } = signIdParamSchema.parse(request.params);

    await prisma.favoriteSign.deleteMany({
      where: {
        userId: request.user!.id,
        signId,
      },
    });

    return response.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao remover favorito.' });
  }
}
