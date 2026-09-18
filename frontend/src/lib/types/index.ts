export type UserRole = 'traveler' | 'provider' | 'concierge' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  status: 'active' | 'suspended';
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  region: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  galleryUrls: string[];
  images?: string[];
  highlights?: string[];
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  startingPriceCents?: number;
  providerCount?: number;
  distanceKm?: number;
  ratingAverage?: number;
  reviewCount?: number;
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  category: string;
  description: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string;
  ratingAverage: number;
  ratingCount: number;
  avgRating?: number | null;
  reviewCount?: number;
  logoUrl?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  galleryUrls?: string[];
  distanceKm?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'listed' | 'suspended' | 'rejected';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  services?: Service[];
  reviews?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  type: string;
  description: string | null;
  shortDescription?: string | null;
  priceCents: number;
  currency: string;
  durationMinutes: number | null;
  maxCapacity: number | null;
  images?: string[];
  inclusions?: string[];
  exclusions?: string[];
  isActive?: boolean;
  isAvailable?: boolean;
  meetingPoint?: string | null;
  includedItems?: string[];
  excludedItems?: string[];
  requirements?: string[];
  cancellationPolicy?: string;
  avgRating?: number | null;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  provider?: Provider;
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'awaiting_payment'
  | 'paid'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'declined'
  | 'expired'
  | 'payment_failed'
  | 'cancelled_by_traveler'
  | 'cancelled_by_provider'
  | 'no_show';

export interface Booking {
  id: string;
  reference: string;
  travelerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: string;
  guestCount: number;
  unitPriceCents: number;
  totalCents: number;
  commissionCents: number;
  providerEarningsCents: number;
  currency: string;
  specialRequests: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  traveler?: { id: string; fullName: string; email: string; phone?: string };
  provider?: { id: string; businessName: string; phone?: string; slug?: string };
  service?: { id: string; name: string; type?: string; meetingPoint?: string };
}

export interface Conversation {
  id: string;
  travelerId: string;
  conciergeId: string | null;
  bookingId: string | null;
  subject: string;
  isEmergency: boolean;
  isClosed: boolean;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  traveler?: { id: string; fullName: string; email: string; phone?: string };
  concierge?: { id: string; fullName: string; email?: string };
  booking?: {
    id: string;
    status: string;
    scheduledDate: string;
    service?: { name: string };
    provider?: { businessName: string };
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender?: { id: string; fullName: string; role: UserRole };
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    nextCursor: string | null;
    hasMore: boolean;
    totalCount?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
