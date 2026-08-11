import 'dotenv/config';
import { PrismaClient, SignSource } from '@prisma/client';

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
    name: 'Saudações',
    slug: 'saudacoes',
    description: 'Cumprimentos e despedidas comuns.',
    iconKey: 'SAUDACOES',
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
    categorySlug: 'saudacoes',
  },
  {
    title: 'Tchau!',
    description: 'Sinal para despedida.',
    example: 'Tchau! Até logo.',
    categorySlug: 'saudacoes',
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

async function seedCategories() {
  for (const category of categorySeeds) {
    await prisma.dictionaryCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
}

async function seedSigns() {
  for (const sign of signSeeds) {
    const category = await prisma.dictionaryCategory.findUnique({
      where: { slug: sign.categorySlug },
      select: { id: true },
    });

    if (!category) {
      throw new Error(`Categoria não encontrada para seed: ${sign.categorySlug}`);
    }

    const existingSign = await prisma.dictionarySign.findFirst({
      where: {
        title: sign.title,
        source: SignSource.SYSTEM,
        ownerId: null,
      },
      select: { id: true },
    });

    if (existingSign) {
      await prisma.dictionarySign.update({
        where: { id: existingSign.id },
        data: {
          title: sign.title,
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
