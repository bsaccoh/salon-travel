import { Job } from 'bullmq';
import { createModuleLogger } from '../../config/logger';
import { authRepository, AuthRepository } from '../../modules/auth/auth.repository';

const log = createModuleLogger('maintenance-processor');

export interface MaintenanceJobData {
  action: 'cleanup_expired_sessions' | 'cleanup_stale_verifications' | 'cleanup_all';
}

export class MaintenanceProcessor {
  constructor(private readonly authRepo: AuthRepository = authRepository) {}

  async process(
    job: Job<MaintenanceJobData>,
  ): Promise<{ sessionsCleaned: number; verificationsCleaned: number }> {
    const { action } = job.data;
    log.info({ jobId: job.id, action }, 'Running maintenance job');

    let sessionsCleaned = 0;
    let verificationsCleaned = 0;

    const now = new Date();

    if (action === 'cleanup_expired_sessions' || action === 'cleanup_all') {
      const result = await this.authRepo.deleteExpiredSessions(now);
      sessionsCleaned = result.count;
      log.info({ sessionsCleaned }, 'Cleaned up expired refresh sessions');
    }

    if (action === 'cleanup_stale_verifications' || action === 'cleanup_all') {
      const result = await this.authRepo.deleteExpiredVerifications(now);
      verificationsCleaned = result.count;
      log.info({ verificationsCleaned }, 'Cleaned up stale verification codes');
    }

    return { sessionsCleaned, verificationsCleaned };
  }
}
