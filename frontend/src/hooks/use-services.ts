'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Service } from '@/lib/types';

interface ServiceFilters {
  type?: string;
  limit?: number;
  cursor?: string;
}

export function useServices(filters?: ServiceFilters) {
  const params = new URLSearchParams();
  if (filters?.type) params.set('type', filters.type);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();

  return useQuery({
    queryKey: ['services', 'public', filters],
    queryFn: () => apiClient.get<Service[]>(`/services${qs ? `?${qs}` : ''}`),
    select: (res) => res.data,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => apiClient.get<Service>(`/services/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useProviderServices(providerId: string) {
  return useQuery({
    queryKey: ['services', 'provider', providerId],
    queryFn: () => apiClient.get<Service[]>(`/providers/${providerId}/services`),
    select: (res) => res.data,
    enabled: !!providerId,
  });
}

export function useMyServices() {
  return useQuery({
    queryKey: ['services', 'mine'],
    queryFn: () => apiClient.get<Service[]>('/providers/me/services'),
    select: (res) => res.data,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Service>) => apiClient.post<Service>('/providers/me/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', 'mine'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Service> & { id: string }) =>
      apiClient.patch<Service>(`/providers/me/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', 'mine'] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/providers/me/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', 'mine'] });
    },
  });
}
