'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Review {
  id: string;
  bookingId: string;
  authorId: string;
  providerId: string;
  rating: number;
  title: string | null;
  content: string | null;
  status: 'pending_moderation' | 'published' | 'hidden';
  createdAt: string;
  author?: { id: string; fullName: string };
}

export function useProviderReviews(providerId: string) {
  return useQuery({
    queryKey: ['reviews', 'provider', providerId],
    queryFn: () => apiClient.get<Review[]>(`/reviews/provider/${providerId}`),
    select: (res) => res.data,
    enabled: !!providerId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: string; rating: number; title?: string; content?: string }) =>
      apiClient.post<Review>('/reviews', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
