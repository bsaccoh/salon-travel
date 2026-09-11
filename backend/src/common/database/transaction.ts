import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export type DatabaseClient = PrismaClient | Prisma.TransactionClient;
export { prisma };
