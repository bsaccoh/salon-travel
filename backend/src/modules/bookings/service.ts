import { Booking, BookingStatus, ProviderStatus, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { bookingRepository, BookingRepository } from './repository';
import { providerRepository, ProviderRepository } from '../providers/repository';
import { serviceRepository, ServiceRepository } from '../services/repository';
import { calculateBookingFinancials } from '../../domain/money/commission';
import { BookingStateMachine } from '../../domain/booking/booking-state-machine';
import { evaluateCancellationRules } from '../../domain/booking/booking-cancellation';
import { NotFoundError, ValidationError, ConflictError } from '../../common/errors';
import { auditService, AuditContext } from '../audit';
import { getQueue, QUEUE_NAMES } from '../../jobs/queues';
import { CreateBookingInput, ListBookingsQuery } from './schemas';
import { createModuleLogger } from '../../config/logger';
import { generateBookingReference } from '../../domain/booking/booking-reference';

const log = createModuleLogger('booking-service');

export class BookingService {
  constructor(
    private readonly repo: BookingRepository = bookingRepository,
    private readonly providerRepo: ProviderRepository = providerRepository,
    private readonly serviceRepo: ServiceRepository = serviceRepository,
  ) {}

  async createBooking(
    travelerId: string,
    input: CreateBookingInput,
    context: AuditContext,
  ): Promise<Booking> {
    const { providerId, serviceId, scheduledDate, scheduledEndDate, guestCount, specialRequests } = input;

    // 1. Validate Provider
    const provider = await this.providerRepo.findById(providerId);
    if (!provider || provider.deletedAt) {
      throw new NotFoundError('Provider', providerId);
    }
    if (provider.status === ProviderStatus.suspended) {
      throw new ConflictError('This provider is currently suspended', 'PROVIDER_SUSPENDED');
    }
    if (provider.status !== ProviderStatus.listed && provider.status !== ProviderStatus.approved) {
      throw new ConflictError('This provider is not currently accepting bookings', 'PROVIDER_NOT_LISTED');
    }

    // 2. Validate Service
    const service = await this.serviceRepo.findById(serviceId);
    if (!service || service.deletedAt) {
      throw new NotFoundError('Service', serviceId);
    }
    if (service.providerId !== provider.id) {
      throw new ValidationError('The requested service does not belong to the specified provider');
    }
    if (!service.isActive) {
      throw new ConflictError('This service is not currently active', 'SERVICE_INACTIVE');
    }

    // 3. Validate Guest Capacity
    if (service.maxCapacity && guestCount > service.maxCapacity) {
      throw new ValidationError(
        `Guest count (${guestCount}) exceeds the maximum capacity of ${service.maxCapacity} for this service`,
      );
    }

    // 4. Validate Scheduled Date
    const serviceDate = new Date(scheduledDate);
    if (isNaN(serviceDate.getTime())) {
      throw new ValidationError('Invalid scheduled date');
    }

    const serviceEndDate = scheduledEndDate ? new Date(scheduledEndDate) : null;
    if (serviceEndDate && isNaN(serviceEndDate.getTime())) {
      throw new ValidationError('Invalid scheduled end date');
    }

    // 5. Calculate Financials Snapshot
    const financials = calculateBookingFinancials({
      serviceBasePriceCents: service.priceCents,
      guestCount,
      serviceCommissionRate: service.commissionRate,
      providerCommissionRate: provider.commissionRate,
    });

    // Expiration: 24 hours from creation
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 6. Generate booking reference (retry on collision)
    let reference: string;
    for (let attempt = 0; attempt < 5; attempt++) {
      reference = generateBookingReference();
      const existing = await prisma.booking.findUnique({ where: { reference } });
      if (!existing) break;
      if (attempt === 4) throw new ConflictError('Failed to generate unique booking reference', 'REFERENCE_COLLISION');
    }

    // 7. Atomic Transaction
    const booking = await prisma.$transaction(async (tx) => {
      const created = await this.repo.create(
        {
          travelerId,
          providerId: provider.id,
          serviceId: service.id,
          reference: reference!,
          status: BookingStatus.pending,
          scheduledDate: serviceDate,
          scheduledEndDate: serviceEndDate,
          guestCount,
          totalCents: financials.totalCents,
          commissionCents: financials.commissionCents,
          providerEarningsCents: financials.providerEarningsCents,
          currency: service.currency || 'SLL',
          specialRequests: specialRequests || null,
          expiresAt,
          version: 1,
        },
        tx,
      );

      // Record immutable booking event
      await this.repo.createEvent(
        {
          bookingId: created.id,
          fromStatus: null,
          toStatus: BookingStatus.pending,
          actorId: travelerId,
          actorRole: UserRole.traveler,
          reason: 'Booking requested by traveler',
        },
        tx,
      );

      // Audit Log
      await auditService.logInTransaction(tx, context, {
        action: 'BOOKING_CREATED',
        resource: 'booking',
        resourceId: created.id,
        metadata: {
          travelerId,
          providerId: provider.id,
          serviceId: service.id,
          totalCents: financials.totalCents,
        },
      });

      return created;
    });

    // 7. Enqueue background notification job
    try {
      const notificationQueue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
      await notificationQueue.add(
        'booking.notify_provider',
        {
          type: 'email',
          to: provider.email || 'provider@salonetravel.dev',
          subject: `New Booking Request #${booking.id.slice(0, 8)}`,
          text: `You have received a new booking request for ${service.name}.`,
          requestId: context.requestId,
        },
        { jobId: `notify_provider:${booking.id}` },
      );
    } catch (err) {
      log.error({ err, bookingId: booking.id }, 'Failed to enqueue provider notification job');
    }

    return booking;
  }

  async acceptBooking(
    userId: string,
    userRole: UserRole,
    bookingId: string,
    context: AuditContext,
  ): Promise<Booking> {
    const booking = await this.repo.findByIdLite(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    if (userRole !== UserRole.admin) {
      const provider = await this.providerRepo.findByUserId(userId);
      if (!provider || provider.id !== booking.providerId) {
        throw new NotFoundError('Booking', bookingId);
      }
    }

    const actorRole = userRole === UserRole.admin ? UserRole.admin : UserRole.provider;

    // Validate transition
    BookingStateMachine.validateTransition({
      fromStatus: booking.status,
      toStatus: BookingStatus.accepted,
      actorRole,
    });

    const updated = await prisma.$transaction(async (tx) => {
      const b = await this.repo.updateStatusWithLock(
        booking.id,
        booking.version,
        {
          status: BookingStatus.accepted,
          confirmedAt: new Date(),
        },
        tx,
      );

      await this.repo.createEvent(
        {
          bookingId: b.id,
          fromStatus: booking.status,
          toStatus: BookingStatus.accepted,
          actorId: userId,
          actorRole,
          reason: userRole === UserRole.admin ? 'Accepted by admin' : 'Accepted by service provider',
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'BOOKING_ACCEPTED',
        resource: 'booking',
        resourceId: b.id,
      });

      return b;
    });

    // Enqueue traveler notification
    try {
      const notificationQueue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
      await notificationQueue.add(
        'booking.notify_traveler_accepted',
        {
          type: 'email',
          to: booking.traveler.email,
          subject: 'Your Booking Request Has Been Accepted!',
          text: `Your booking for ${booking.service.name} was accepted by ${booking.provider.businessName}.`,
          requestId: context.requestId,
        },
        { jobId: `notify_traveler_accepted:${booking.id}` },
      );
    } catch (err) {
      log.error({ err, bookingId: booking.id }, 'Failed to enqueue traveler acceptance notification');
    }

    return updated;
  }

  async declineBooking(
    userId: string,
    userRole: UserRole,
    bookingId: string,
    reason: string | undefined,
    context: AuditContext,
  ): Promise<Booking> {
    const booking = await this.repo.findByIdLite(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    if (userRole !== UserRole.admin) {
      const provider = await this.providerRepo.findByUserId(userId);
      if (!provider || provider.id !== booking.providerId) {
        throw new NotFoundError('Booking', bookingId);
      }
    }

    const actorRole = userRole === UserRole.admin ? UserRole.admin : UserRole.provider;

    BookingStateMachine.validateTransition({
      fromStatus: booking.status,
      toStatus: BookingStatus.declined,
      actorRole,
      reason,
    });

    const updated = await prisma.$transaction(async (tx) => {
      const b = await this.repo.updateStatusWithLock(
        booking.id,
        booking.version,
        {
          status: BookingStatus.declined,
          declinedReason: reason || 'Declined by provider',
        },
        tx,
      );

      await this.repo.createEvent(
        {
          bookingId: b.id,
          fromStatus: booking.status,
          toStatus: BookingStatus.declined,
          actorId: userId,
          actorRole,
          reason,
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'BOOKING_DECLINED',
        resource: 'booking',
        resourceId: b.id,
        metadata: { reason },
      });

      return b;
    });

    // Enqueue notifications
    try {
      const notificationQueue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
      await notificationQueue.add(
        'booking.notify_traveler_declined',
        {
          type: 'email',
          to: booking.traveler.email,
          subject: 'Booking Request Update',
          text: `Your booking request was declined by ${booking.provider.businessName}. Reason: ${reason || 'Not specified'}.`,
          requestId: context.requestId,
        },
        { jobId: `notify_traveler_declined:${booking.id}` },
      );
    } catch (err) {
      log.error({ err, bookingId: booking.id }, 'Failed to enqueue decline notification');
    }

    return updated;
  }

  async cancelBooking(
    userId: string,
    userRole: UserRole,
    bookingId: string,
    reason: string | undefined,
    context: AuditContext,
  ): Promise<Booking> {
    const booking = await this.repo.findByIdLite(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    // Check caller ownership
    let isTraveler = false;
    let isProvider = false;

    if (userRole === UserRole.traveler && booking.travelerId === userId) {
      isTraveler = true;
    } else {
      const provider = await this.providerRepo.findByUserId(userId);
      if (provider && provider.id === booking.providerId) {
        isProvider = true;
      }
    }

    if (!isTraveler && !isProvider && userRole !== UserRole.admin && userRole !== UserRole.concierge) {
      throw new NotFoundError('Booking', bookingId);
    }

    const targetStatus = isProvider
      ? BookingStatus.cancelled_by_provider
      : BookingStatus.cancelled_by_traveler;

    BookingStateMachine.validateTransition({
      fromStatus: booking.status,
      toStatus: targetStatus,
      actorRole: isProvider ? UserRole.provider : UserRole.traveler,
      reason,
    });

    // Evaluate cancellation refund rules
    const cancellationEvaluation = evaluateCancellationRules({
      actorRole: isProvider ? UserRole.provider : UserRole.traveler,
      scheduledDate: booking.scheduledDate,
      totalCents: booking.totalCents,
      providerEarningsCents: booking.providerEarningsCents,
    });

    const updated = await prisma.$transaction(async (tx) => {
      const b = await this.repo.updateStatusWithLock(
        booking.id,
        booking.version,
        {
          status: targetStatus,
          cancellationReason: reason || cancellationEvaluation.reasonSummary,
        },
        tx,
      );

      await this.repo.createEvent(
        {
          bookingId: b.id,
          fromStatus: booking.status,
          toStatus: targetStatus,
          actorId: userId,
          actorRole: userRole,
          reason: reason || cancellationEvaluation.reasonSummary,
          metadata: cancellationEvaluation as any,
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'BOOKING_CANCELLED',
        resource: 'booking',
        resourceId: b.id,
        metadata: {
          cancelledBy: isProvider ? 'provider' : 'traveler',
          evaluation: cancellationEvaluation as any,
        },
      });

      return b;
    });

    // Enqueue auto-refund if eligible
    if (cancellationEvaluation.refundAmountCents > 0) {
      try {
        const paymentsQueue = getQueue(QUEUE_NAMES.PAYMENTS);
        await paymentsQueue.add(
          'refund.auto_cancellation',
          {
            bookingId: booking.id,
            refundAmountCents: cancellationEvaluation.refundAmountCents,
            reason: isProvider ? 'provider_cancelled' : 'traveler_cancelled',
            initiatedBy: userId,
            requestId: context.requestId,
          },
          { jobId: `auto_refund:${booking.id}` },
        );
        log.info(
          { bookingId: booking.id, refundAmountCents: cancellationEvaluation.refundAmountCents },
          'Auto-refund job enqueued',
        );
      } catch (err) {
        log.error({ err, bookingId: booking.id }, 'Failed to enqueue auto-refund job');
      }
    }

    return updated;
  }

  async completeBooking(
    userId: string,
    userRole: UserRole,
    bookingId: string,
    context: AuditContext,
  ): Promise<Booking> {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    if (userRole !== UserRole.admin) {
      const provider = await this.providerRepo.findByUserId(userId);
      if (!provider || provider.id !== booking.providerId) {
        throw new NotFoundError('Booking', bookingId);
      }
    }

    const actorRole = userRole === UserRole.admin ? UserRole.admin : UserRole.provider;

    BookingStateMachine.validateTransition({
      fromStatus: booking.status,
      toStatus: BookingStatus.completed,
      actorRole,
    });

    const updated = await prisma.$transaction(async (tx) => {
      const b = await this.repo.updateStatusWithLock(
        booking.id,
        booking.version,
        {
          status: BookingStatus.completed,
          completedAt: new Date(),
        },
        tx,
      );

      await this.repo.createEvent(
        {
          bookingId: b.id,
          fromStatus: booking.status,
          toStatus: BookingStatus.completed,
          actorId: userId,
          actorRole: UserRole.provider,
          reason: 'Marked completed by service provider',
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'BOOKING_COMPLETED',
        resource: 'booking',
        resourceId: b.id,
      });

      return b;
    });

    // Enqueue review prompt job
    try {
      const notificationQueue = getQueue(QUEUE_NAMES.NOTIFICATIONS);
      await notificationQueue.add(
        'review.prompt_traveler',
        {
          type: 'email',
          to: booking.traveler.email,
          subject: 'How was your experience? Leave a review!',
          text: `Your booking for ${booking.service.name} is complete. Please leave a review to help other travelers.`,
          requestId: context.requestId,
        },
        {
          jobId: `prompt_review:${booking.id}`,
          delay: 86400 * 1000, // 24 hour delay
        },
      );
    } catch (err) {
      log.error({ err, bookingId: booking.id }, 'Failed to enqueue review prompt job');
    }

    return updated;
  }

  async noShowBooking(
    userId: string,
    bookingId: string,
    reason: string | undefined,
    context: AuditContext,
  ): Promise<Booking> {
    const booking = await this.repo.findByIdLite(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider || provider.id !== booking.providerId) {
      throw new NotFoundError('Booking', bookingId);
    }

    BookingStateMachine.validateTransition({
      fromStatus: booking.status,
      toStatus: BookingStatus.no_show,
      actorRole: UserRole.provider,
      reason,
    });

    return prisma.$transaction(async (tx) => {
      const b = await this.repo.updateStatusWithLock(
        booking.id,
        booking.version,
        {
          status: BookingStatus.no_show,
        },
        tx,
      );

      await this.repo.createEvent(
        {
          bookingId: b.id,
          fromStatus: booking.status,
          toStatus: BookingStatus.no_show,
          actorId: userId,
          actorRole: UserRole.provider,
          reason: reason || 'Traveler did not show up',
        },
        tx,
      );

      await auditService.logInTransaction(tx, context, {
        action: 'BOOKING_NO_SHOW',
        resource: 'booking',
        resourceId: b.id,
        metadata: { reason },
      });

      return b;
    });
  }

  async getBookingById(userId: string, userRole: UserRole, bookingId: string) {
    const booking = await this.repo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking', bookingId);
    }

    // Role-based access control
    if (userRole === UserRole.admin || userRole === UserRole.concierge) {
      return booking;
    }

    if (userRole === UserRole.traveler && booking.travelerId === userId) {
      return booking;
    }

    const provider = await this.providerRepo.findByUserId(userId);
    if (provider && provider.id === booking.providerId) {
      return booking;
    }

    throw new NotFoundError('Booking', bookingId);
  }

  async listTravelerBookings(travelerId: string, query: ListBookingsQuery) {
    return this.repo.listByTraveler(travelerId, query);
  }

  async listProviderBookings(userId: string, query: ListBookingsQuery) {
    const provider = await this.providerRepo.findByUserId(userId);
    if (!provider) {
      throw new NotFoundError('Provider profile');
    }
    return this.repo.listByProvider(provider.id, query);
  }
}

export const bookingService = new BookingService();
