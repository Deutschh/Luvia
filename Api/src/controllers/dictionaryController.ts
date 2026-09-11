import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  dictionaryCategorySelect,
  dictionarySignSelect,
  getVisibleCategoriesWhere,
  getVisibleSignsWhere,
  normalizeDictionaryCategoryName,
  normalizeDictionarySignTitle,
  slugifyDictionaryCategoryName,
} from '../utils/dictionary';

const signIdParamSchema = z.object({
  id: z.string().uuid('Id do sinal inválido.'),
});

const categoryIdParamSchema = z.object({
  id: z.string().uuid('Id da categoria inválido.'),
});

const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres.').optional(),
    description: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value === undefined ? undefined : value.length > 0 ? value : null)),
  })
  .refine(
    (data) => data.name !== undefined || data.description !== undefined,
    {
      message: 'Informe ao menos um campo para atualização.',
    }
  );

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
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.example !== undefined ||
      data.categoryId !== undefined,
    {
      message: 'Informe ao menos um campo para atualização.',
    }
  );

const searchSignsQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

async function findVisibleCategoryByIdOrSlug(category: string, userId: string) {
  return prisma.dictionaryCategory.findFirst({
    where: {
      AND: [
        getVisibleCategoriesWhere(userId),
        {
          OR: [
            { id: category },
            { slug: category },
          ],
        },
      ],
    },
    select: {
      id: true,
    },
  });
}

async function findVisibleCategoryById(categoryId: string, userId: string) {
  return prisma.dictionaryCategory.findFirst({
    where: {
      id: categoryId,
      ...getVisibleCategoriesWhere(userId),
    },
    select: {
      id: true,
      slug: true,
      iconKey: true,
    },
  });
}

function isFavoritesCategory(category: { slug: string; iconKey: string | null }) {
  return category.slug === 'favoritos' || category.iconKey === 'FAVORITOS';
}

function buildVisibleSignsWhere(userId: string, filters: Prisma.DictionarySignWhereInput[] = []) {
  return {
    AND: [getVisibleSignsWhere(userId), ...filters],
  } satisfies Prisma.DictionarySignWhereInput;
}

async function findDuplicateDictionaryCategory(params: {
  name: string;
  ownerId: string | null;
  excludeId?: string;
}) {
  const normalizedName = normalizeDictionaryCategoryName(params.name);

  return prisma.dictionaryCategory.findFirst({
    where: {
      ownerId: params.ownerId,
      normalizedName,
      ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
    },
    select: { id: true },
  });
}

async function findDuplicateDictionarySign(params: {
  title: string;
  categoryId: string;
  ownerId: string | null;
  excludeId?: string;
}) {
  const normalizedTitle = normalizeDictionarySignTitle(params.title);

  return prisma.dictionarySign.findFirst({
    where: {
      categoryId: params.categoryId,
      ownerId: params.ownerId,
      normalizedTitle,
      ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
    },
    select: { id: true },
  });
}

async function generateUniqueCategorySlug(name: string, excludeId?: string) {
  const baseSlug = slugifyDictionaryCategoryName(name);
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existingCategory = await prisma.dictionaryCategory.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existingCategory) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function listDictionaryCategories(request: Request, response: Response) {
  try {
    const categories = await prisma.dictionaryCategory.findMany({
      where: getVisibleCategoriesWhere(request.user!.id),
      orderBy: [
        { source: 'asc' },
        { name: 'asc' },
      ],
      select: dictionaryCategorySelect,
    });

    return response.json(categories);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao listar categorias.' });
  }
}

export async function createDictionaryCategory(request: Request, response: Response) {
  try {
    const data = createCategorySchema.parse(request.body);

    const duplicateCategory = await findDuplicateDictionaryCategory({
      name: data.name,
      ownerId: request.user!.id,
    });

    if (duplicateCategory) {
      return response.status(409).json({ message: 'Você já possui uma categoria com esse nome.' });
    }

    const category = await prisma.dictionaryCategory.create({
      data: {
        name: data.name,
        normalizedName: normalizeDictionaryCategoryName(data.name),
        slug: await generateUniqueCategorySlug(data.name),
        description: data.description,
        iconKey: 'CUSTOM',
        ownerId: request.user!.id,
        source: 'USER',
      },
      select: dictionaryCategorySelect,
    });

    return response.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return response.status(409).json({ message: 'Você já possui uma categoria com esse nome.' });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao criar categoria.' });
  }
}

export async function updateDictionaryCategory(request: Request, response: Response) {
  try {
    const { id } = categoryIdParamSchema.parse(request.params);
    const data = updateCategorySchema.parse(request.body);

    const existingCategory = await prisma.dictionaryCategory.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        ownerId: true,
        source: true,
      },
    });

    if (!existingCategory) {
      return response.status(404).json({ message: 'Categoria não encontrada.' });
    }

    if (existingCategory.source === 'SYSTEM') {
      return response.status(403).json({ message: 'Categorias do sistema não podem ser editadas.' });
    }

    if (existingCategory.ownerId !== request.user!.id) {
      return response.status(403).json({ message: 'Você só pode editar categorias criadas por você.' });
    }

    const nextName = data.name ?? existingCategory.name;

    const duplicateCategory = await findDuplicateDictionaryCategory({
      name: nextName,
      ownerId: request.user!.id,
      excludeId: id,
    });

    if (duplicateCategory) {
      return response.status(409).json({ message: 'Você já possui uma categoria com esse nome.' });
    }

    const category = await prisma.dictionaryCategory.update({
      where: { id },
      data: {
        name: nextName,
        normalizedName: normalizeDictionaryCategoryName(nextName),
        slug: data.name ? await generateUniqueCategorySlug(nextName, id) : existingCategory.slug,
        description: data.description,
      },
      select: dictionaryCategorySelect,
    });

    return response.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return response.status(409).json({ message: 'Você já possui uma categoria com esse nome.' });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao atualizar categoria.' });
  }
}

export async function deleteDictionaryCategory(request: Request, response: Response) {
  try {
    const { id } = categoryIdParamSchema.parse(request.params);

    const existingCategory = await prisma.dictionaryCategory.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        source: true,
      },
    });

    if (!existingCategory) {
      return response.status(404).json({ message: 'Categoria não encontrada.' });
    }

    if (existingCategory.source === 'SYSTEM') {
      return response.status(403).json({ message: 'Categorias do sistema não podem ser excluídas.' });
    }

    if (existingCategory.ownerId !== request.user!.id) {
      return response.status(403).json({ message: 'Você só pode excluir categorias criadas por você.' });
    }

    const linkedSignsCount = await prisma.dictionarySign.count({
      where: { categoryId: id },
    });

    if (linkedSignsCount > 0) {
      return response.status(409).json({ message: 'Não é possível excluir uma categoria que possui sinais.' });
    }

    await prisma.dictionaryCategory.delete({
      where: { id },
    });

    return response.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao excluir categoria.' });
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
      const resolvedCategory = await findVisibleCategoryByIdOrSlug(category, request.user!.id);

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
      where: buildVisibleSignsWhere(request.user!.id, [{ id }]),
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
    const normalizedTitle = normalizeDictionarySignTitle(data.title);

    const category = await findVisibleCategoryById(data.categoryId, request.user!.id);

    if (!category) {
      return response.status(400).json({ message: 'Categoria inválida.' });
    }

    if (isFavoritesCategory(category)) {
      return response.status(400).json({
        message: 'Favoritos não é uma categoria válida para criação de sinais.',
      });
    }

    const duplicateSign = await findDuplicateDictionarySign({
      title: data.title,
      categoryId: data.categoryId,
      ownerId: request.user!.id,
    });

    if (duplicateSign) {
      return response.status(409).json({ message: 'Já existe um sinal com esse nome nesta categoria.' });
    }

    const sign = await prisma.dictionarySign.create({
      data: {
        title: data.title,
        normalizedTitle,
        description: data.description,
        example: data.example,
        categoryId: data.categoryId,
        ownerId: request.user!.id,
        isPublic: false,
        source: 'USER',
      },
      select: dictionarySignSelect,
    });

    return response.status(201).json(sign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return response.status(409).json({ message: 'Já existe um sinal com esse nome nesta categoria.' });
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
        title: true,
        categoryId: true,
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
      const category = await findVisibleCategoryById(data.categoryId, request.user!.id);

      if (!category) {
        return response.status(400).json({ message: 'Categoria inválida.' });
      }

      if (isFavoritesCategory(category)) {
        return response.status(400).json({
          message: 'Favoritos não é uma categoria válida para criação de sinais.',
        });
      }
    }

    const nextTitle = data.title ?? existingSign.title;
    const nextCategoryId = data.categoryId ?? existingSign.categoryId;
    const normalizedTitle = normalizeDictionarySignTitle(nextTitle);

    const duplicateSign = await findDuplicateDictionarySign({
      title: nextTitle,
      categoryId: nextCategoryId,
      ownerId: request.user!.id,
      excludeId: id,
    });

    if (duplicateSign) {
      return response.status(409).json({ message: 'Já existe um sinal com esse nome nesta categoria.' });
    }

    const sign = await prisma.dictionarySign.update({
      where: { id },
      data: {
        title: nextTitle,
        normalizedTitle,
        description: data.description,
        example: data.example,
        categoryId: nextCategoryId,
        isPublic: false,
      },
      select: dictionarySignSelect,
    });

    return response.json(sign);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return response.status(409).json({ message: 'Já existe um sinal com esse nome nesta categoria.' });
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
