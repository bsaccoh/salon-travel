import { Payment } from '@prisma/client';

export interface PresentedPayment {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  status: string;
  paidAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  booking?: any;
}

export function paymentPresenter(p: Payment | any): PresentedPayment {
  return {
    id: p.id,
    bookingId: p.bookingId,
    amountCents: Number(p.amountCents),
    currency: p.currency,
    status: p.status,
    paidAt: p.paidAt || null,
    failureReason: p.failureReason || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    ...(p.booking ? { booking: p.booking } : {}),
  };
}

export function paymentListPresenter(items: (Payment | any)[]): PresentedPayment[] {
  return items.map(paymentPresenter);
}
