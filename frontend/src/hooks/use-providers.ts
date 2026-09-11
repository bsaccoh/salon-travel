'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Provider } from '@/lib/types';

interface ProviderFilters {
  category?: string;
  search?: string;
  near?: string;
  limit?: number;
}

export function useProviders(filters?: ProviderFilters) {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.near) params.set('near', filters.near);
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  return useQuery({
    queryKey: ['providers', filters],
    queryFn: () => apiClient.get<Provider[]>(`/providers${qs ? `?${qs}` : ''}`),
    select: (res) => res.data,
  });
}

export function useProvider(slug: string) {
  return useQuery({
    queryKey: ['provider', slug],
    queryFn: () => apiClient.get<Provider>(`/providers/${slug}`),
    select: (res) => res.data,
    enabled: !!slug,
  });
}

export function useMyProvider() {
  return useQuery({
    queryKey: ['provider', 'me'],
    queryFn: () => apiClient.get<Provider>('/providers/me'),
    select: (res) => res.data,
  });
}

interface DashboardStats {
  pendingRequests: number;
  upcomingBookings: number;
  completedBookings: number;
  totalBookings: number;
  grossBookingValue: number;
  grossRevenueCents: number;
  providerEarnings: number;
  providerEarningsCents: number;
  commissionDeductedCents: number;
  commission: number;
  commissionRate: number;
  averageRating: number | null;
  profileViews: number;
  netEarnings: number;
  refundAdjustments: number;
}

export function useProviderDashboard() {
  return useQuery({
    queryKey: ['provider', 'dashboard'],
    queryFn: () => apiClient.get<DashboardStats>('/providers/me/dashboard'),
    select: (res) => res.data,
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Provider>) => apiClient.patch<Provider>('/providers/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'me'] });
    },
  });
}

interface ProviderDocument {
  id: string;
  name: string;
  fileName: string;
  type: string;
  status: string;
  url: string;
  createdAt: string;
}

export function useMyDocuments() {
  return useQuery({
    queryKey: ['provider', 'documents'],
    queryFn: () => apiClient.get<ProviderDocument[]>('/providers/me/documents'),
    select: (res) => res.data,
  });
}

interface UploadDocumentInput {
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadDocumentInput) => apiClient.post('/providers/me/documents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/providers/me/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'documents'] });
    },
  });
}

export function useSubmitForVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<Provider>('/providers/me/submit'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider'] });
    },
  });
}
