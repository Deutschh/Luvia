import { Prisma } from '@prisma/client';

export const dictionaryCategorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  iconKey: true,
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

export function getVisibleSignsWhere(userId: string): Prisma.DictionarySignWhereInput {
  return {
    OR: [
      { isPublic: true },
      { ownerId: userId },
    ],
  };
}
