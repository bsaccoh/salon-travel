'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Destination } from '@/lib/types';

interface DestinationFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  near?: string;
  limit?: number;
}

export function useDestinations(filters?: DestinationFilters) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.featured) params.set('featured', 'true');
  if (filters?.near) params.set('near', filters.near);
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  return useQuery({
    queryKey: ['destinations', filters],
    queryFn: () => apiClient.get<Destination[]>(`/destinations${qs ? `?${qs}` : ''}`),
    select: (res) => res.data,
  });
}

export function useDestination(slug: string) {
  return useQuery({
    queryKey: ['destination', slug],
    queryFn: () => apiClient.get<Destination>(`/destinations/${slug}`),
    select: (res) => res.data,
    enabled: !!slug,
  });
}

export interface CreateDestinationInput {
  name: string;
  category: string;
  region?: string;
  description?: string;
}

export function useCreateDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDestinationInput) =>
      apiClient.post<Destination>('/destinations', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
    },
  });
}
