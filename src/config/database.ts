// src/config/database.ts
import { PrismaClient } from '@prisma/client' //Importando o Prisma
import { PrismaNeon } from '@prisma/adapter-neon' //Prisma Neon
import { env } from './env.js'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() { 
  const adapter = new PrismaNeon({
    connectionString: env.DATABASE_URL,
  })

  return new PrismaClient({ adapter })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}