import { Booking, BookingEvent } from '@prisma/client';

export interface PresentedBooking {
  id: string;
  travelerId: string;
  providerId: string;
  serviceId: string;
  status: string;
  scheduledDate: Date;
  guestCount: number;
  unitPriceCents: number;
  totalCents: number;
  commissionCents: number;
  providerEarningsCents: number;
  currency: string;
  specialRequests: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  traveler?: any;
  provider?: any;
  service?: any;
  events?: PresentedBookingEvent[];
}

export interface PresentedBookingEvent {
  id: string;
  bookingId: string;
  fromStatus: string;
  toStatus: string;
  actorRole: string;
  actorId: string | null;
  reason: string | null;
  createdAt: Date;
}

export function bookingEventPresenter(evt: BookingEvent | any): PresentedBookingEvent {
  return {
    id: evt.id,
    bookingId: evt.bookingId,
    fromStatus: evt.fromStatus,
    toStatus: evt.toStatus,
    actorRole: evt.actorRole,
    actorId: evt.actorId || null,
    reason: evt.reason || null,
    createdAt: evt.createdAt,
  };
}

export function bookingPresenter(b: Booking | any): PresentedBooking {
  return {
    id: b.id,
    travelerId: b.travelerId,
    providerId: b.providerId,
    serviceId: b.serviceId,
    status: b.status,
    scheduledDate: b.scheduledDate,
    guestCount: Number(b.guestCount),
    unitPriceCents: Number(b.unitPriceCents),
    totalCents: Number(b.totalCents),
    commissionCents: Number(b.commissionCents),
    providerEarningsCents: Number(b.providerEarningsCents),
    currency: b.currency,
    specialRequests: b.specialRequests || null,
    cancellationReason: b.cancellationReason || null,
    cancelledAt: b.cancelledAt || null,
    confirmedAt: b.confirmedAt || null,
    completedAt: b.completedAt || null,
    version: Number(b.version),
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    ...(b.traveler ? { traveler: b.traveler } : {}),
    ...(b.provider ? { provider: b.provider } : {}),
    ...(b.service ? { service: b.service } : {}),
    ...(b.events ? { events: b.events.map(bookingEventPresenter) } : {}),
  };
}

export function bookingListPresenter(items: (Booking | any)[]): PresentedBooking[] {
  return items.map(bookingPresenter);
}
