import { prisma } from '../../config/database';
import { User, Prisma, UserStatus, UserRole } from '@prisma/client';
import { DatabaseClient } from '../../common/database/transaction';
import { buildPaginationArgs, paginateResults } from '../../common/pagination';

export class UserRepository {
  async findById(id: string, db: DatabaseClient = prisma): Promise<User | null> {
    return db.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string, db: DatabaseClient = prisma): Promise<User | null> {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput, db: DatabaseClient = prisma): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: UserStatus, db: DatabaseClient = prisma): Promise<User> {
    return db.user.update({
      where: { id },
      data: { status },
    });
  }

  async updateRole(id: string, role: UserRole, db: DatabaseClient = prisma): Promise<User> {
    return db.user.update({
      where: { id },
      data: { role },
    });
  }

  async list(query: { role?: UserRole; status?: UserStatus; cursor?: string; limit?: number }) {
    const { role, status } = query;
    const limit = query.limit ?? 20;
    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    };

    const paginationArgs = buildPaginationArgs({ ...query, limit });

    const items = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...paginationArgs,
    });

    return paginateResults(items, limit);
  }
}

export const userRepository = new UserRepository();
