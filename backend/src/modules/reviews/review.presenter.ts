import { Review } from '@prisma/client';

export interface PresentedReview {
  id: string;
  bookingId: string;
  travelerId: string;
  providerId: string;
  rating: number;
  content: string;
  isVerifiedBooking: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  traveler?: any;
  provider?: any;
}

export function reviewPresenter(r: Review | any): PresentedReview {
  return {
    id: r.id,
    bookingId: r.bookingId,
    travelerId: r.travelerId,
    providerId: r.providerId,
    rating: Number(r.rating),
    content: r.content,
    isVerifiedBooking: Boolean(r.isVerifiedBooking),
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    ...(r.traveler ? { traveler: r.traveler } : {}),
    ...(r.provider ? { provider: r.provider } : {}),
  };
}

export function reviewListPresenter(items: (Review | any)[]): PresentedReview[] {
  return items.map(reviewPresenter);
}
