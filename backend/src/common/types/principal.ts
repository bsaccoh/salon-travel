import { UserRole } from '@prisma/client';

export interface Principal {
  userId: string;
  role: UserRole;
  email?: string;
  sessionId?: string;
}
