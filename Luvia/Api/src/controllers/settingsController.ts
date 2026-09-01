import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const updateSettingsSchema = z
  .object({
    voiceType: z.string().trim().min(1, 'voiceType não pode ser vazio.').optional(),
    speechRate: z.number().min(0.5, 'speechRate deve estar entre 0.5 e 2.').max(2, 'speechRate deve estar entre 0.5 e 2.').optional(),
    speechVolume: z.number().min(0, 'speechVolume deve estar entre 0 e 1.').max(1, 'speechVolume deve estar entre 0 e 1.').optional(),
    autoSpeak: z.boolean().optional(),
    hapticFeedback: z.boolean().optional(),
    notificationsEnabled: z.boolean().optional(),
    darkMode: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos uma configuração para atualizar.',
  });

export async function getMySettings(request: Request, response: Response) {
  try {
    const settings = await prisma.userSettings.upsert({
      where: { userId: request.user!.id },
      update: {},
      create: { userId: request.user!.id },
    });

    return response.json(settings);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao buscar configurações.' });
  }
}

export async function updateMySettings(request: Request, response: Response) {
  try {
    const data = updateSettingsSchema.parse(request.body);

    const settings = await prisma.userSettings.upsert({
      where: { userId: request.user!.id },
      update: data,
      create: {
        userId: request.user!.id,
        ...data,
      },
    });

    return response.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ message: 'Dados inválidos.', errors: error.issues });
    }

    console.error(error);
    return response.status(500).json({ message: 'Erro interno ao atualizar configurações.' });
  }
}
