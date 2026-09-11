import { Job } from 'bullmq';
import { prisma } from '../../config/database';
import { createModuleLogger } from '../../config/logger';
import { BookingStatus } from '@prisma/client';
import { bookingRepository, BookingRepository } from '../../modules/bookings/repository';

const log = createModuleLogger('booking-processor');

export interface BookingJobData {
  action: 'check_expired_bookings' | 'send_reminder';
  bookingId?: string;
}

export class BookingProcessor {
  constructor(private readonly bookingRepo: BookingRepository = bookingRepository) {}

  async process(job: Job<BookingJobData>): Promise<{ expiredCount?: number; processed: boolean }> {
    const { action, bookingId } = job.data;
    log.info({ jobId: job.id, action, bookingId }, 'Processing booking job');

    if (action === 'check_expired_bookings') {
      const now = new Date();
      // Find pending bookings that have expired
      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: BookingStatus.pending,
          expiresAt: { lt: now },
        },
      });

      let count = 0;
      for (const booking of expiredBookings) {
        await prisma.$transaction(async (tx) => {
          await this.bookingRepo.updateStatusWithLock(
            booking.id,
            booking.version,
            { status: BookingStatus.expired },
            tx,
          );

          await this.bookingRepo.createEvent(
            {
              bookingId: booking.id,
              fromStatus: BookingStatus.pending,
              toStatus: BookingStatus.expired,
              actorId: null,
              actorRole: 'system',
              reason: 'Automatic expiration by system scheduler',
            },
            tx,
          );
        });
        count++;
      }

      log.info({ expiredCount: count }, 'Expired stale pending bookings');
      return { expiredCount: count, processed: true };
    }

    return { processed: true };
  }
}
