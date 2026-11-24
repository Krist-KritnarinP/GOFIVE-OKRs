import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

let prismaInstance = null;

export function getPrismaClient() {
  if (env.storageMode !== 'prisma') {
    return null;
  }
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
