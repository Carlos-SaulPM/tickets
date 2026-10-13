import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { env } from '@/config/env';

const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };

const globalWithPrisma = globalThis as GlobalWithPrisma;

export const prisma: PrismaClient =
  env.NODE_ENV !== 'production'
    ? (globalWithPrisma.prisma ??= createPrismaClient())
    : createPrismaClient();
