'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amountCents: number;
  currency: string;
  status: string;
}

interface Payment {
  id: string;
  bookingId: string;
  stripePaymentIntentId: string | null;
  status: string;
  amountCents: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => apiClient.get<Payment>(`/payments/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: { bookingId: string }) =>
      apiClient.post<PaymentIntent>('/payments/intents', data, {
        idempotencyKey: `payment_${data.bookingId}`,
      }),
  });
}
