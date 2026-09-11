'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Booking, BookingStatus } from '@/lib/types';

interface BookingFilters {
  status?: BookingStatus;
  limit?: number;
  cursor?: string;
}

export function useMyBookings(filters?: BookingFilters) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();

  return useQuery({
    queryKey: ['bookings', 'mine', filters],
    queryFn: () => apiClient.get<Booking[]>(`/bookings/mine${qs ? `?${qs}` : ''}`),
    select: (res) => res.data,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => apiClient.get<Booking>(`/bookings/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useProviderBookings(filters?: BookingFilters) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();

  return useQuery({
    queryKey: ['bookings', 'provider', filters],
    queryFn: () => apiClient.get<Booking[]>(`/provider/bookings${qs ? `?${qs}` : ''}`),
    select: (res) => res.data,
  });
}

interface CreateBookingInput {
  providerId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledEndDate?: string;
  guestCount?: number;
  specialRequests?: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingInput) =>
      apiClient.post<Booking>('/bookings', data, {
        idempotencyKey: `booking_${data.serviceId}_${data.scheduledDate}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post<Booking>(`/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useAcceptBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Booking>(`/bookings/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useDeclineBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post<Booking>(`/bookings/${id}/decline`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<Booking>(`/bookings/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
