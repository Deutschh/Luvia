import { Prisma } from '@prisma/client';

export const dictionaryCategorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  iconKey: true,
  ownerId: true,
  source: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DictionaryCategorySelect;

export const dictionarySignSelect = {
  id: true,
  title: true,
  description: true,
  example: true,
  ownerId: true,
  isPublic: true,
  source: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: dictionaryCategorySelect,
  },
} satisfies Prisma.DictionarySignSelect;

export function normalizeDictionarySignTitle(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeDictionaryCategoryName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function slugifyDictionaryCategoryName(name: string) {
  const slug = normalizeDictionaryCategoryName(name)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'categoria';
}

export function getVisibleCategoriesWhere(userId: string): Prisma.DictionaryCategoryWhereInput {
  return {
    OR: [
      { source: 'SYSTEM' },
      { ownerId: userId },
    ],
  };
}

export function getVisibleSignsWhere(userId: string): Prisma.DictionarySignWhereInput {
  return {
    AND: [
      {
        OR: [
          { source: 'SYSTEM' },
          { ownerId: userId },
        ],
      },
      {
        category: getVisibleCategoriesWhere(userId),
      },
    ],
  };
}
