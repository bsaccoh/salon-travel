import { UserRepository, userRepository } from './user.repository';
import { User, UserStatus } from '@prisma/client';
import { NotFoundError } from '../../common/errors';
import { RequestContext } from '../../common/types/context';
import { auditService } from '../audit';

export class UserService {
  constructor(private readonly repo: UserRepository = userRepository) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  async listUsers(query: { role?: any; status?: UserStatus; cursor?: string; limit?: number }) {
    return this.repo.list(query);
  }

  async suspendUser(
    adminId: string,
    targetUserId: string,
    reason: string | undefined,
    context: RequestContext,
  ): Promise<User> {
    const user = await this.getUserById(targetUserId);
    const updated = await this.repo.updateStatus(user.id, UserStatus.suspended);

    await auditService.log(
      {
        actorId: adminId,
        actorRole: 'admin',
        requestId: context.requestId,
        ipAddress: context.ip,
      },
      {
        action: 'USER_SUSPENDED',
        resource: 'user',
        resourceId: targetUserId,
        metadata: { reason },
      },
    );

    return updated;
  }

  async reactivateUser(
    adminId: string,
    targetUserId: string,
    context: RequestContext,
  ): Promise<User> {
    const user = await this.getUserById(targetUserId);
    const updated = await this.repo.updateStatus(user.id, UserStatus.active);

    await auditService.log(
      {
        actorId: adminId,
        actorRole: 'admin',
        requestId: context.requestId,
        ipAddress: context.ip,
      },
      {
        action: 'USER_REACTIVATED',
        resource: 'user',
        resourceId: targetUserId,
      },
    );

    return updated;
  }
}

export const userService = new UserService();
