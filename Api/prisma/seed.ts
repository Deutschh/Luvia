import 'dotenv/config';
import { DictionaryCategorySource, PrismaClient, SignSource } from '@prisma/client';

const prisma = new PrismaClient();

const categorySeeds = [
  {
    name: 'Essenciais',
    slug: 'essenciais',
    description: 'Sinais básicos para comunicação do dia a dia.',
    iconKey: 'ESSENCIAIS',
  },
  {
    name: 'Favoritos',
    slug: 'favoritos',
    description: 'Categoria inicial para atalhos e sinais frequentes.',
    iconKey: 'FAVORITOS',
  },
  {
    name: 'Bem-estar',
    slug: 'bem-estar',
    description: 'Sinais relacionados a emoções e saúde.',
    iconKey: 'BEM_ESTAR',
  },
  {
    name: 'Sociais',
    slug: 'sociais',
    description: 'Interações sociais, cumprimentos e expressões comuns.',
    iconKey: 'SOCIAIS',
  },
  {
    name: 'Emergência',
    slug: 'emergencia',
    description: 'Sinais úteis em situações urgentes.',
    iconKey: 'EMERGENCIA',
  },
];

const signSeeds = [
  {
    title: 'Oi!',
    description: 'Sinal para saudação inicial.',
    example: 'Oi! Tudo bem?',
    categorySlug: 'sociais',
  },
  {
    title: 'Tchau!',
    description: 'Sinal para despedida.',
    example: 'Tchau! Até logo.',
    categorySlug: 'sociais',
  },
  {
    title: 'Obrigado',
    description: 'Forma de agradecer.',
    example: 'Obrigado pela ajuda.',
    categorySlug: 'essenciais',
  },
  {
    title: 'Sim',
    description: 'Resposta afirmativa.',
    example: 'Sim, eu entendi.',
    categorySlug: 'essenciais',
  },
  {
    title: 'Não',
    description: 'Resposta negativa.',
    example: 'Não, obrigado.',
    categorySlug: 'essenciais',
  },
  {
    title: 'Tô triste',
    description: 'Expressa sentimento de tristeza.',
    example: 'Hoje eu tô triste.',
    categorySlug: 'bem-estar',
  },
  {
    title: 'Estou com dor',
    description: 'Indica desconforto físico.',
    example: 'Estou com dor no braço.',
    categorySlug: 'bem-estar',
  },
  {
    title: 'Preciso de ajuda',
    description: 'Pedido de auxílio imediato.',
    example: 'Preciso de ajuda agora.',
    categorySlug: 'emergencia',
  },
];

function normalizeDictionarySignTitle(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeDictionaryCategoryName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

async function seedCategories() {
  for (const category of categorySeeds) {
    const normalizedName = normalizeDictionaryCategoryName(category.name);
    const existingCategory = await prisma.dictionaryCategory.findFirst({
      where: {
        ownerId: null,
        source: DictionaryCategorySource.SYSTEM,
        OR:
          category.slug === 'sociais'
            ? [
                { slug: 'sociais' },
                { slug: 'saudacoes' },
                { name: 'Sociais' },
                { name: 'Saudações' },
                { normalizedName: 'sociais' },
                { normalizedName: 'saudacoes' },
                { iconKey: 'SOCIAIS' },
                { iconKey: 'SAUDACOES' },
              ]
            : [
                { slug: category.slug },
                { normalizedName },
              ],
      },
      select: { id: true },
    });

    if (existingCategory) {
      await prisma.dictionaryCategory.update({
        where: { id: existingCategory.id },
        data: {
          ...category,
          normalizedName,
          ownerId: null,
          source: DictionaryCategorySource.SYSTEM,
        },
      });
      continue;
    }

    await prisma.dictionaryCategory.create({
      data: {
        ...category,
        normalizedName,
        ownerId: null,
        source: DictionaryCategorySource.SYSTEM,
      },
    });
  }
}

async function seedSigns() {
  for (const sign of signSeeds) {
    const normalizedTitle = normalizeDictionarySignTitle(sign.title);

    const category = await prisma.dictionaryCategory.findUnique({
      where: { slug: sign.categorySlug },
      select: { id: true },
    });

    if (!category) {
      throw new Error(`Categoria não encontrada para seed: ${sign.categorySlug}`);
    }

    const existingSign = await prisma.dictionarySign.findFirst({
      where: {
        categoryId: category.id,
        normalizedTitle,
        ownerId: null,
      },
      select: { id: true },
    });

    if (existingSign) {
      await prisma.dictionarySign.update({
        where: { id: existingSign.id },
        data: {
          title: sign.title,
          normalizedTitle,
          description: sign.description,
          example: sign.example,
          categoryId: category.id,
          isPublic: true,
          source: SignSource.SYSTEM,
        },
      });
    } else {
      await prisma.dictionarySign.create({
        data: {
          title: sign.title,
          normalizedTitle,
          description: sign.description,
          example: sign.example,
          categoryId: category.id,
          isPublic: true,
          source: SignSource.SYSTEM,
        },
      });
    }
  }
}

async function main() {
  await seedCategories();
  await seedSigns();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
