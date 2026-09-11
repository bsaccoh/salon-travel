import {
  NotificationProcessor,
  EmailJobData,
  SmsJobData,
} from '../../src/jobs/processors/notification.processor';
import { MaintenanceProcessor } from '../../src/jobs/processors/maintenance.processor';
import { BookingProcessor } from '../../src/jobs/processors/booking.processor';
import { EmailProvider, SmsProvider } from '../../src/integrations';
import { Job } from 'bullmq';
import { BookingStatus } from '@prisma/client';
import { prisma } from '../../src/config/database';

// Mock Prisma
jest.mock('../../src/config/database', () => {
  const mPrisma: Record<string, any> = {
    $transaction: jest.fn(async (callback: (tx: any) => Promise<any>): Promise<any> =>
      callback(mPrisma),
    ),
    refreshSession: {
      deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
    },
    emailVerification: {
      deleteMany: jest.fn().mockResolvedValue({ count: 12 }),
    },
    booking: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'b-1', status: 'expired' }),
    },
    bookingEvent: {
      create: jest.fn(),
    },
  };
  return { prisma: mPrisma };
});

describe('Background Processors (Unit)', () => {
  describe('NotificationProcessor', () => {
    let mockEmailProvider: jest.Mocked<EmailProvider>;
    let mockSmsProvider: jest.Mocked<SmsProvider>;
    let processor: NotificationProcessor;

    beforeEach(() => {
      mockEmailProvider = {
        send: jest.fn().mockResolvedValue({ messageId: 'msg-email-123' }),
      };
      mockSmsProvider = {
        send: jest.fn().mockResolvedValue({ messageId: 'msg-sms-123' }),
      };
      processor = new NotificationProcessor(mockEmailProvider, mockSmsProvider);
    });

    it('should process email notification job', async () => {
      const mockJob = {
        id: 'job-1',
        attemptsMade: 0,
        data: {
          type: 'email',
          to: 'traveler@example.com',
          subject: 'Welcome to Salone Travel',
          text: 'Welcome!',
        } as EmailJobData,
      } as Job<EmailJobData>;

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-email-123');
      expect(mockEmailProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'traveler@example.com',
          subject: 'Welcome to Salone Travel',
        }),
      );
    });

    it('should process SMS notification job', async () => {
      const mockJob = {
        id: 'job-2',
        attemptsMade: 0,
        data: {
          type: 'sms',
          to: '+23276123456',
          body: 'Your booking has been accepted!',
        } as SmsJobData,
      } as Job<SmsJobData>;

      const result = await processor.process(mockJob);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-sms-123');
      expect(mockSmsProvider.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+23276123456',
          body: 'Your booking has been accepted!',
        }),
      );
    });

    it('should throw error when provider fails so BullMQ can retry', async () => {
      mockEmailProvider.send.mockRejectedValueOnce(new Error('SendGrid network timeout'));

      const mockJob = {
        id: 'job-3',
        attemptsMade: 1,
        data: {
          type: 'email',
          to: 'traveler@example.com',
          subject: 'Welcome',
        } as EmailJobData,
      } as Job<EmailJobData>;

      await expect(processor.process(mockJob)).rejects.toThrow('SendGrid network timeout');
    });
  });

  describe('MaintenanceProcessor', () => {
    it('should clean up expired sessions and stale verification codes', async () => {
      const processor = new MaintenanceProcessor();

      const mockJob = {
        id: 'maint-1',
        data: { action: 'cleanup_all' },
      } as any;

      const result = await processor.process(mockJob);

      expect(result.sessionsCleaned).toBe(5);
      expect(result.verificationsCleaned).toBe(12);
    });
  });

  describe('BookingProcessor', () => {
    it('should expire stale pending bookings and create booking events', async () => {
      (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'booking-1', version: 1, status: BookingStatus.pending },
        { id: 'booking-2', version: 2, status: BookingStatus.pending },
      ]);
      (prisma.booking.update as jest.Mock).mockResolvedValue({});
      (prisma.bookingEvent.create as jest.Mock).mockResolvedValue({});

      const processor = new BookingProcessor();
      const mockJob = {
        id: 'book-job-1',
        data: { action: 'check_expired_bookings' },
      } as any;

      const result = await processor.process(mockJob);

      expect(result.expiredCount).toBe(2);
      expect(prisma.booking.updateMany).toHaveBeenCalledTimes(2);
      expect(prisma.bookingEvent.create).toHaveBeenCalledTimes(2);
    });
  });
});
