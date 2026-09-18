'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User, Provider, Booking } from '@/lib/types';

interface AdminFilters {
  status?: string;
  role?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

function buildQs(filters?: AdminFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.role) params.set('role', filters.role);
  if (filters.search) params.set('search', filters.search);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useAdminUsers(filters?: AdminFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => apiClient.get<User[]>(`/admin/users${buildQs(filters)}`),
    select: (res) => res.data,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => apiClient.get<User>(`/admin/users/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useAdminProviders(filters?: AdminFilters) {
  return useQuery({
    queryKey: ['admin', 'providers', filters],
    queryFn: () => apiClient.get<Provider[]>(`/admin/providers${buildQs(filters)}`),
    select: (res) => res.data,
  });
}

export function useAdminProvider(id: string) {
  return useQuery({
    queryKey: ['admin', 'provider', id],
    queryFn: () => apiClient.get<Provider>(`/admin/providers/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useAdminBookings(filters?: AdminFilters) {
  return useQuery({
    queryKey: ['admin', 'bookings', filters],
    queryFn: () => apiClient.get<Booking[]>(`/admin/bookings${buildQs(filters)}`),
    select: (res) => res.data,
  });
}

export function useAdminBooking(id: string) {
  return useQuery({
    queryKey: ['admin', 'booking', id],
    queryFn: () => apiClient.get<Booking>(`/admin/bookings/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

interface Payment {
  id: string;
  bookingId: string;
  status: string;
  amountCents: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

export function useAdminPayments(filters?: AdminFilters) {
  return useQuery({
    queryKey: ['admin', 'payments', filters],
    queryFn: () => apiClient.get<Payment[]>(`/admin/payments${buildQs(filters)}`),
    select: (res) => res.data,
  });
}

interface Refund {
  id: string;
  bookingId: string;
  reason: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
}

export function useAdminRefunds(filters?: AdminFilters) {
  return useQuery({
    queryKey: ['admin', 'refunds', filters],
    queryFn: () => apiClient.get<Refund[]>(`/admin/refunds${buildQs(filters)}`),
    select: (res) => res.data,
  });
}

export function useAdminUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiClient.patch(`/admin/users/${id}`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/users/${id}/suspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/users/${id}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminApproveProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/providers/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
    },
  });
}

export function useAdminRejectProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/admin/providers/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
    },
  });
}

export function useAdminSuspendProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/admin/providers/${id}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
    },
  });
}

export function useAdminReinstateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/providers/${id}/reinstate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
    },
  });
}

export function useAdminModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'published' | 'hidden' }) =>
      apiClient.post(`/admin/reviews/${id}/moderate`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export interface DashboardStats {
  totalTravelers: number;
  totalProviders: number;
  approvedProviders: number;
  pendingProviders: number;
  totalBookings: number;
  recentBookings: number;
  grossRevenueCents: number;
  commissionCents: number;
  bookingsByStatus: Record<string, number>;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiClient.get<DashboardStats>('/admin/dashboard'),
    select: (res) => res.data,
  });
}

interface AdminReview {
  id: string;
  bookingId: string;
  authorId: string;
  providerId: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  createdAt: string;
  author: { id: string; fullName: string };
  provider: { id: string; businessName: string };
}

export function useAdminReviews(filters?: AdminFilters) {
  return useQuery({
    queryKey: ['admin', 'reviews', filters],
    queryFn: () => apiClient.get<AdminReview[]>(`/admin/reviews${buildQs(filters)}`),
    select: (res) => res.data,
  });
}

export interface ConciergeStats {
  unclaimedConversations: number;
  myConversations: number;
  openCases: number;
  emergencyConversations: number;
  todaysBookings: number;
}

export function useConciergeStats() {
  return useQuery({
    queryKey: ['admin', 'concierge-stats'],
    queryFn: () => apiClient.get<ConciergeStats>('/admin/dashboard/concierge'),
    select: (res) => res.data,
  });
}

export interface ChartDataPoint {
  month: string;
  bookings: number;
  revenueCents: number;
}

export function useAdminChart() {
  return useQuery({
    queryKey: ['admin', 'chart'],
    queryFn: () => apiClient.get<ChartDataPoint[]>('/admin/dashboard/chart'),
    select: (res) => res.data,
  });
}

export interface ActivityEvent {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  actorName: string;
  actorRole: string | null;
  metadata: any;
  createdAt: string;
}

export function useAdminActivity() {
  return useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: () => apiClient.get<ActivityEvent[]>('/admin/activity'),
    select: (res) => res.data,
  });
}
