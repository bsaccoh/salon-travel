import { Refund } from '@prisma/client';

export interface PresentedRefund {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  reason: string;
  status: string;
  notes: string | null;
  initiatedBy: string;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  booking?: any;
}

export function refundPresenter(r: Refund | any): PresentedRefund {
  return {
    id: r.id,
    bookingId: r.bookingId,
    amountCents: Number(r.amountCents),
    currency: r.currency,
    reason: r.reason,
    status: r.status,
    notes: r.notes || null,
    initiatedBy: r.initiatedBy,
    processedAt: r.processedAt || null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    ...(r.booking ? { booking: r.booking } : {}),
  };
}

export function refundListPresenter(items: (Refund | any)[]): PresentedRefund[] {
  return items.map(refundPresenter);
}
