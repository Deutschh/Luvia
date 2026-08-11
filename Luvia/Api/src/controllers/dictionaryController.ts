import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  dictionaryCategorySelect,
  dictionarySignSelect,
  getVisibleSignsWhere,
} from '../utils/dictionary';

const signIdParamSchema = z.object({
  id: z.string().uuid('Id do sinal inválido.'),
});

const createSignSchema = z.object({
  title: z.string().trim().min(1, 'Título obrigatório.'),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  example: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  categoryId: z.string().uuid('Categoria obrigatória.'),
  isPublic: z.boolean().optional(),
});

const updateSignSchema = z
  .object({
    title: z.string().trim().min(1, 'Título obrigatório.').optional(),
    description: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value === undefined ? undefined : value.length > 0 ? value : null)),
    example: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value === undefined ? undefined : value.length > 0 ? value : null)),
    categoryId: z.string().uuid('Categoria inválida.').optional(),
    isPublic: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.example !== undefined ||
      data.categoryId !== undefined ||
      data.isPublic !== undefined,
    {
      message: 'Informe ao menos um campo para atualização.',
    }
  );

const searchSignsQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

async function findCategoryByIdOrSlug(category: string) {
  return prisma.dictionaryCategory.findFirst({
    where: {
      OR: [
        { id: category },
        { slug: category },
      ],
    },
    select: {
      id: true,
    },
  });
}

function buildVisibleSignsWhere(userId: string, filters: Prisma.DictionarySignWhereInput[] = []) {
  return {
    AND: [getVisibleSignsWhere(userId), ...filters],
  } satisfies Prisma.DictionarySignWhereInput;
}

export async function listDictionaryCategories(request: Request, response: Response) {
  try {
    const categories = await prisma.dictionaryCategory.findMany({
      orderBy: { createdAt: 'asc' },
      select: dictionaryCategorySelect,
    });

    return response.json(categories);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao listar categorias.' });
  }
}

export async function listDictionarySigns(request: Request, response: Response) {
  try {
    const signs = await prisma.dictionarySign.findMany({
      where: buildVisibleSignsWhere(request.user!.id),
      orderBy: [
        { source: 'asc' },
        { title: 'asc' },
      ],
      select: dictionarySignSelect,
    });

    return response.json(signs);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao listar sinais.' });
  }
}

export async function searchDictionarySigns(request: Request, response: Response) {
  try {
    const { q, category } = searchSignsQuerySchema.parse(request.query);
    const filters: Prisma.DictionarySignWhereInput[] = [];

    if (q) {
      filters.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { example: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (category) {
      const resolvedCategory = await findCategoryByIdOrSlug(category);

      if (!resolvedCategory) {
        return response.status(400).json({ message: 'Categoria inválida.' });
      }

      filters.push({ categoryId: resolvedCategory.id });
    }

    const signs = await prisma.dictionarySign.findMany({
      where: buildVisibleSignsWhere(request.user!.id, filters),
      orderBy: [
        { source: 'asc' },
        { title: 'asc' },
      ],
      select: dictionarySignSelect,
    });

    return response.json(signs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao buscar sinais.' });
  }
}

export async function getDictionarySignById(request: Request, response: Response) {
  try {
    const { id } = signIdParamSchema.parse(request.params);

    const sign = await prisma.dictionarySign.findFirst({
      where: {
        id,
        ...getVisibleSignsWhere(request.user!.id),
      },
      select: dictionarySignSelect,
    });

    if (!sign) {
      return response.status(404).json({ message: 'Sinal não encontrado.' });
    }

    return response.json(sign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao buscar sinal.' });
  }
}

export async function createDictionarySign(request: Request, response: Response) {
  try {
    const data = createSignSchema.parse(request.body);

    const category = await prisma.dictionaryCategory.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });

    if (!category) {
      return response.status(400).json({ message: 'Categoria inválida.' });
    }

    const sign = await prisma.dictionarySign.create({
      data: {
        title: data.title,
        description: data.description,
        example: data.example,
        categoryId: data.categoryId,
        ownerId: request.user!.id,
        isPublic: data.isPublic ?? true,
        source: 'USER',
      },
      select: dictionarySignSelect,
    });

    return response.status(201).json(sign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao criar sinal.' });
  }
}

export async function updateDictionarySign(request: Request, response: Response) {
  try {
    const { id } = signIdParamSchema.parse(request.params);
    const data = updateSignSchema.parse(request.body);

    const existingSign = await prisma.dictionarySign.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!existingSign) {
      return response.status(404).json({ message: 'Sinal não encontrado.' });
    }

    if (existingSign.ownerId !== request.user!.id) {
      return response.status(403).json({ message: 'Você só pode editar sinais criados por você.' });
    }

    if (data.categoryId) {
      const category = await prisma.dictionaryCategory.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
      });

      if (!category) {
        return response.status(400).json({ message: 'Categoria inválida.' });
      }
    }

    const sign = await prisma.dictionarySign.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        example: data.example,
        categoryId: data.categoryId,
        isPublic: data.isPublic,
      },
      select: dictionarySignSelect,
    });

    return response.json(sign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao atualizar sinal.' });
  }
}

export async function deleteDictionarySign(request: Request, response: Response) {
  try {
    const { id } = signIdParamSchema.parse(request.params);

    const existingSign = await prisma.dictionarySign.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
      },
    });

    if (!existingSign) {
      return response.status(404).json({ message: 'Sinal não encontrado.' });
    }

    if (existingSign.ownerId !== request.user!.id) {
      return response.status(403).json({ message: 'Você só pode remover sinais criados por você.' });
    }

    await prisma.dictionarySign.delete({
      where: { id },
    });

    return response.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao remover sinal.' });
  }
}
