import { Prisma } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  role: true,
  avatarUrl: true,
  authProvider: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export function getDefaultNameFromEmail(email: string) {
  return email.split('@')[0] || email;
}
