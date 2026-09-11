import { Service } from '@prisma/client';

export interface PresentedService {
  id: string;
  providerId: string;
  name: string;
  type: string;
  description: string | null;
  priceCents: number;
  currency: string;
  durationMinutes: number | null;
  maxCapacity: number | null;
  isAvailable: boolean;
  meetingPoint: string | null;
  includedItems: string[];
  excludedItems: string[];
  requirements: string[];
  cancellationPolicy: string;
  createdAt: Date;
  updatedAt: Date;
}

export function servicePresenter(s: Service | any): PresentedService {
  return {
    id: s.id,
    providerId: s.providerId,
    name: s.name,
    type: s.type,
    description: s.description || null,
    priceCents: Number(s.priceCents),
    currency: s.currency,
    durationMinutes: s.durationMinutes ? Number(s.durationMinutes) : null,
    maxCapacity: s.maxCapacity ? Number(s.maxCapacity) : null,
    isAvailable: Boolean(s.isAvailable),
    meetingPoint: s.meetingPoint || null,
    includedItems: s.includedItems || [],
    excludedItems: s.excludedItems || [],
    requirements: s.requirements || [],
    cancellationPolicy: s.cancellationPolicy,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function serviceListPresenter(items: (Service | any)[]): PresentedService[] {
  return items.map(servicePresenter);
}
