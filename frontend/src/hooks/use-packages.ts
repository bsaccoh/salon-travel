'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Package {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category: string;
  duration_days: number;
  duration_nights: number;
  location?: string;
  hero_image_url?: string;
  price_per_person_cents: number;
  currency: string;
  highlights: string[];
  itinerary: any[];
  includes: string[];
  max_guests: number;
  badge?: string;
  is_featured: boolean;
  is_active: boolean;
  provider_id?: string;
  service_id?: string;
  created_at: string;
  updated_at: string;
}

interface PackageFilters {
  category?: string;
  featured?: boolean;
  limit?: number;
  cursor?: string;
}

export function usePackages(filters?: PackageFilters) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.featured) params.set('featured', 'true');
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();

  return useQuery({
    queryKey: ['packages', filters],
    queryFn: () => apiClient.get<Package[]>(`/packages${qs ? `?${qs}` : ''}`),
    select: (res) => res.data,
  });
}

export function usePackage(slug: string) {
  return useQuery({
    queryKey: ['package', slug],
    queryFn: () => apiClient.get<Package>(`/packages/${slug}`),
    select: (res) => res.data,
    enabled: !!slug,
  });
}
