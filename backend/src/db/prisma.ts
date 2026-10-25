import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };

const globalWithPrisma = globalThis as GlobalWithPrisma;

export const prisma: PrismaClient =
  env.NODE_ENV !== "production"
    ? (globalWithPrisma.prisma ??= createPrismaClient())
    : createPrismaClient();
